const awilix = require('awilix');
const path = require('path'); 

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY // Proxy modu: Her şeyi bir obje ({}) içinde gönderir
});

container.loadModules(
  
  [
    '../repositories/*.js', // config klasöründen bir üste (src) çık ve repository'leri bul
    '!../repositories/base.repository.js', // ! Base repository'yi hariç tut
    '../services/*.js',     // Tüm service'leri bul
    '../controllers/*.js'   // Tüm controller'ları bul
  ],
  
  {
    cwd: __dirname, // Arama işlemini tam olarak bu dosyanın bulunduğu konumdan başlat
    formatName: 'camelCase', // Dosya isimlerini camelCase yap (örn: user.repository.js -> userRepository)
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON, // Her şeyden sadece 1 tane üret, RAM'i yorma
      register: awilix.asClass // Hepsini birer "Class" (Sınıf) olarak kaydet
    }
  }
);


module.exports = container;