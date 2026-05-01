const awilix = require('awilix');

// 1. Tedarikçiyi (Konteyneri) oluştur
const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY // Proxy modu: Her şeyi bir obje ({}) içinde gönderir
});

// 2. Modülleri otomatik bul ve kaydet (Sihir burada!)
container.loadModules(
  [
    'src/repositories/*.js', // Tüm repository'leri bul
    '!src/repositories/base.repository.js', // ! Bunu hariç tut
    'src/services/*.js',     // Tüm service'leri bul
    'src/controllers/*.js'   // Tüm controller'ları bul
  ],
  {
    formatName: 'camelCase', // Dosya isimlerini camelCase yap (örn: user.repository.js -> userRepository)
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON, // Her şeyden sadece 1 tane üret, RAM'i yorma
      register: awilix.asClass // Hepsini birer "Class" (Sınıf) olarak kaydet
    }
  }
);

module.exports = container;