const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const PomodoroMapper = require("../mappers/pomodoro.mapper");

class PomodoroService {
  constructor({
    pomodoroRepository,
    statisticRepository,
    profileRepository,
    profileService,
    streakService,
  }) {
    this.pomodoroRepository = pomodoroRepository;
    this.statisticRepository = statisticRepository;
    this.profileService = profileService;
    this.profileRepository = profileRepository;
    this.streakService = streakService;
  }

  async createSession(userId, bodyData) {
    const { category, duration } = bodyData;
    const newSession = await this.pomodoroRepository.create({
      user: userId,
      duration,
      category,
    });
    return { newSession: PomodoroMapper.toResponse(newSession) };
  }

  async updateSessionStatus(sessionId, userId, status) {
    const allowedStatuses = ["running", "paused", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException("Geçersiz Pomodoro durumu!");
    }

    const session = await this.pomodoroRepository.findById(sessionId);
    if (!session) {
      throw new BadRequestException("Pomodoro bulunamadı!");
    }

    if (session.user.toString() !== userId.toString()) {
      throw new UnauthorizedException("Bu oturumu değiştiremezsiniz.");
    }

    const updatedSession = await this.pomodoroRepository.update(sessionId, { status });
    
    // Güvenli ID temizliği
    const cleanId = (userId && typeof userId === "object") ? (userId.id || userId._id || userId.user) : userId;
    const cleanIdStr = cleanId.toString();

    let updatedProfile = null;

    if (status === "completed") {
      // İstatistik Güncelleme (Geçmiş kodundan gelen kısım)
      if (this.statisticRepository && this.statisticRepository.incrementStats) {
         await this.statisticRepository.incrementStats(cleanIdStr, session.duration);
      }

      if (this.profileRepository) {
        const profile = await this.profileRepository.findByUserId(cleanIdStr);
        
        // Seri Hesapla
        const streakData = await this.streakService.calculateStreak(
          profile?.currentStreak || 0,
          profile?.bestStreak || 0,
          profile?.lastSessionDate || null
        );

        // İstatistikleri kaydet
        await this.profileRepository.updateStats(
          cleanIdStr,
          session.duration,
          streakData.currentStreak,
          streakData.bestStreak,
          streakData.lastSessionDate
        );
      }

      // XP Kazan
      await this.profileService.gainXp(cleanIdStr, session.duration);
      
      // Profilin en güncel halini döndür
      updatedProfile = await this.profileService.getUserProfile(cleanIdStr);
    }

    return {
      updatedSession: PomodoroMapper.toResponse(updatedSession),
      updatedProfile,
    };
  }

  async getUserHistory(userId) {
    const pomodoros = await this.pomodoroRepository.getUserHistory(userId);
    return pomodoros.map((pomodoro) => PomodoroMapper.toResponse(pomodoro));
  }
  async getDailyDashboardStats(userId) {
    // 1. KULLANICI KONTROLÜ: userId bir obje mi yoksa düz string mi bak, içinden gerçek ID'yi çıkar
    const cleanId = userId && typeof userId === "object" ? userId.id || userId._id || userId.user : userId;
    
    // 2. ZAMAN SINIRLARI: Bugünün başlangıcını ayarla (Örn: 03.05.2026 00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    // Bugünü bitişini ayarla (Örn: 03.05.2026 23:59:59)
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. VERİTABANI SORGUSU: Veritabanına git, sadece bu kullanıcıya ait ve "bugün" içinde oluşturulmuş oturumları getir
    const todaySessions = await this.pomodoroRepository.model.find({
      user: cleanId,
      createdAt: { $gte: startOfDay, $lte: endOfDay } // $gte: büyük eşit, $lte: küçük eşit
    });

    // 4. BAŞARI ANALİZİ: Gelen tüm kayıtlardan durumu sadece "completed" (tamamlanmış) olanları filtrele
    const completedSessions = todaySessions.filter(s => s.status === "completed");
    
    // Tamamlanan oturumların duration (süre) değerlerini toplayarak toplam dakikayı bul
    const todayFocusMinutes = completedSessions.reduce((acc, curr) => acc + curr.duration, 0);
    
    // Toplam dakikayı 60'a bölerek saat cinsine çevir ve virgülden sonra 1 basamak göster (Örn: 2.5)
    const todayFocusHours = (todayFocusMinutes / 60).toFixed(1);

    // 5. VERİMLİLİK HESABI: Toplam kaç kez başlanmış (Tamamlanan + İptal Edilenler)
    const totalAttempted = todaySessions.filter(s => s.status === "completed" || s.status === "cancelled").length;
    
    // Eğer hiç deneme yoksa 0 döndür, varsa (Tamamlanan / Toplam Deneme) * 100 ile başarı oranını bul
    const efficiency = totalAttempted === 0 ? 0 : Math.round((completedSessions.length / totalAttempted) * 100);

    // 6. KATEGORİ DAĞILIMI (Pasta Grafik İçin):
    const categoryMap = {}; // Örn: { "Yazılım": 50, "Ders": 25 } şeklinde bir harita tutacak
    completedSessions.forEach(s => {
      const cat = s.category || "Diğer"; // Kategori yoksa "Diğer" kabul et
      categoryMap[cat] = (categoryMap[cat] || 0) + s.duration; // Mevcut sürenin üzerine ekle
    });

    // Grafik renk paleti
    const colors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];
    
    // Haritayı (categoryMap) Frontend'in pasta grafik için istediği [{name, value, color}] formatına çevir
    const categoryData = Object.keys(categoryMap).map((key, index) => ({
      name: key,
      value: categoryMap[key],
      color: colors[index % colors.length]
    }));

    // 7. SAATLİK DAĞILIM (Çizgi Grafik İçin):
    const hourlyMap = {};
    // Grafiğin boş görünmemesi için 08:00 ile 23:00 arasını "0 dakika" ile önceden doldur
    for (let i = 8; i <= 23; i++) {
      hourlyMap[`${i.toString().padStart(2, "0")}:00`] = 0;
    }

    // Her bir tamamlanmış oturumu, yapıldığı saate (hour) göre ilgili kutucuğa ekle
    completedSessions.forEach(s => {
      const hour = new Date(s.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, "0")}:00`;
      if (hourlyMap[hourKey] !== undefined) {
        hourlyMap[hourKey] += s.duration; // O saatte kaç dakika odaklanılmışsa ekle
      } else {
        hourlyMap[hourKey] = s.duration; // Liste dışı (Örn: gece 02) bir saatse yeni kutu aç
      }
    });

    // Haritayı çizgi grafiğin istediği [{time, duration}] formatına çevir
    const hourlyData = Object.keys(hourlyMap).map(key => ({
      time: key,
      duration: hourlyMap[key]
    }));

    // 8. SON OTURUMLAR LİSTESİ: Bugünkü tüm oturumları al
    const recentSessions = [...todaySessions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // En yeni olan en üstte (descending)
      .slice(0, 4) // Sadece son 4 tanesini getir
      .map(s => ({
        id: s._id,
        category: s.category || "Diğer",
        time: new Date(s.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }), // Saati okunabilir yap (21:45)
        duration: `${s.duration} dk`,
        status: s.status === "completed" ? "Tamamlandı" : (s.status === "cancelled" ? "İptal" : s.status)
      }));

    // 9. SONUÇLARI PAKETLE: Frontend'in Dashboard'u doldurabilmesi için tüm hesapları tek bir obje olarak gönder
    return {
      todayFocusHours,
      todaySessionsCount: completedSessions.length,
      efficiency,
      categoryData: categoryData.length > 0 ? categoryData : [{ name: "Veri Yok", value: 1, color: "#334155" }],
      hourlyData,
      recentSessions
    };
}
}

module.exports = PomodoroService;