let urlDB;
let usr = 'admin';
let psw = 'M7Df8LKyavJv5jEl';
let coleccion = 'estacion_meteorologica';
process.env.PORT = process.env.PORT || 3000;
urlDB = `mongodb+srv://${usr}:${psw}@cluster0.q9zgn.mongodb.net/${coleccion}`;


process.env.URLDB = urlDB;