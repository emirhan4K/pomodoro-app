const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Odaklan API',
    description: 'Odaklan Pomodoro Backend API'
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

// Çıktıyı src klasörünün içine atacak
const outputFile = './src/swagger-output.json'; 

// Rotaları src/app.js dosyasından okuyacak
const endpointsFiles = ['./src/app.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("✅ Swagger dosyası oluşturuldu!");
});