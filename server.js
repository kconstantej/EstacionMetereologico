require("./config/config");
let ciudades2 = ["Guayaquil",
    "Quito",
    "Cuenca"
];
let ciudad_q;
let validator;
let resBase;
let fechas_base = [];
let temperaturas_base = [];
let sen_termica_base = [];
let presion_base = [];
let precipitacion_base = [];
let humedad_base = [];
let capa_nubes_base = [];
let v_viento_base = [];
let data_medias;
const climaConsulta = require('./controller/apiclima');
const express = require('express'),
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads') // Agregamos el directorio donde se guardarán los archivos.
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname) // Le pasamos el nombre original del archvio, también podriamos cambiar el nombre concatenando la fecha actual.
        }
    }),
    upload = multer({ storage }), // Cambiamos el atributo dest por el storage.
    app = express();
const hbs = require('hbs');
const Clima = require("./models/clima");
const fs = require('fs');
const XLSX = require('xlsx');
const txtToJson = require("txt-file-to-json");
const mongoose = require("mongoose");
const csv = require('csv-parser');
const convert = require('xml-js');
const bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
let urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let filename = "";
let dataClima;
//Metodo para poner el año en el fotter
hbs.registerHelper('getAnio', () => {
    return new Date().getFullYear();
});

app.set('view engine', 'hbs');
app.get('/', function(req, res) {
    ciudad_q = "Quito";
    Clima.find({
            ciudad: ciudad_q,
        })
        .sort({ hora_local: -1 })
        .limit(5)
        .exec((err, data) => {
            resBase = data;
            fechas_base = [];
            temperaturas_base = [];
            sen_termica_base = [];
            presion_base = [];
            precipitacion_base = [];
            humedad_base = [];
            capa_nubes_base = [];
            v_viento_base = [];
            let media_temp = 0;
            let media_sensacion_ter = 0
            let media_humedad = 0
            let media_v_viento = 0
            let media_presion = 0
            let media_capa_nubes = 0
            let media_precipitaciones = 0
            for (let i = 0; i < resBase.length; i++) {
                let date = new Date(resBase[i].hora_local);
                fechas_base.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes());
                let nueva_fecha = diaSemana(date);
                resBase[i].pais = capitalize(nueva_fecha);
                temperaturas_base.push(resBase[i].temperatura);
                sen_termica_base.push(resBase[i].sensacion_termica);
                presion_base.push(resBase[i].presion);
                precipitacion_base.push(resBase[i].precipitacion);
                humedad_base.push(resBase[i].humedad);
                capa_nubes_base.push(resBase[i].capa_nubes);
                v_viento_base.push(resBase[i].velocidad_viento);
                media_temp += resBase[i].temperatura;
                media_sensacion_ter += resBase[i].sensacion_termica;
                media_humedad += resBase[i].humedad;
                media_v_viento += resBase[i].velocidad_viento;
                media_presion += resBase[i].presion;
                media_capa_nubes += resBase[i].capa_nubes;
                media_precipitaciones += resBase[i].precipitacion;
                resBase[i].descripcion_tiempo = translateWeather(resBase[i].descripcion_tiempo);
            }
            data_medias = {
                "m_temperatura": Math.round((media_temp / resBase.length) * 100) / 100,
                "m_sensacion_termica": Math.round((media_sensacion_ter / resBase.length) * 100) / 100,
                "m_humedad": Math.round((media_humedad / resBase.length) * 100) / 100,
                "m_v_viento": Math.round((media_v_viento / resBase.length) * 100) / 100,
                "m_presion": Math.round((media_presion / resBase.length) * 100) / 100,
                "m_capa_nubes": Math.round((media_capa_nubes / resBase.length) * 100) / 100,
                "m_precipitacion": Math.round((media_precipitaciones / resBase.length) * 100) / 100
            };
        });
    climaConsulta.getClima(ciudad_q)
        .then(respuesta => {
            dataClima = respuesta;
            let titulo_tablas = dataClima.Ciudad;
            const date = new Date(dataClima.Fecha);
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dataClima.Fecha = date.toLocaleDateString('es-EC', options);
            let hora_api = date.getHours() + ":" + date.getMinutes();
            let max = max_time();
            let fondo = getFondo(dataClima.Descripcion);
            let titulo_2 = "Desde " + resBase[4].hora_local.toLocaleString() + " hasta " + resBase[0].hora_local.toLocaleString();
            res.render('index', {
                "respuesta": dataClima,
                "tabla": resBase,
                "fechas": fechas_base,
                "temperaturas": temperaturas_base,
                "sensaciones_termicas": sen_termica_base,
                "presiones": presion_base,
                "precipitaciones": precipitacion_base,
                "humedades": humedad_base,
                "capas_nubes": capa_nubes_base,
                "velocidades_viento": v_viento_base,
                "fondo": fondo,
                "medias": data_medias,
                "hora_api": hora_api,
                "titulo": titulo_tablas,
                "max": max,
                "titulo_2": titulo_2,
                "error": ""
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/consultaClima', (req, res) => {
    ciudad_q = "Quito";
    Clima.find({
            ciudad: ciudad_q,
        })
        .sort({ hora_local: -1 })
        .limit(5)
        .exec((err, data) => {
            resBase = data;
            fechas_base = [];
            temperaturas_base = [];
            sen_termica_base = [];
            presion_base = [];
            precipitacion_base = [];
            humedad_base = [];
            capa_nubes_base = [];
            v_viento_base = [];
            let media_temp = 0;
            let media_sensacion_ter = 0
            let media_humedad = 0
            let media_v_viento = 0
            let media_presion = 0
            let media_capa_nubes = 0
            let media_precipitaciones = 0
            for (let i = 0; i < resBase.length; i++) {
                let date = new Date(resBase[i].hora_local);
                fechas_base.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes());
                let nueva_fecha = diaSemana(date);
                resBase[i].pais = capitalize(nueva_fecha);
                temperaturas_base.push(resBase[i].temperatura);
                sen_termica_base.push(resBase[i].sensacion_termica);
                presion_base.push(resBase[i].presion);
                precipitacion_base.push(resBase[i].precipitacion);
                humedad_base.push(resBase[i].humedad);
                capa_nubes_base.push(resBase[i].capa_nubes);
                v_viento_base.push(resBase[i].velocidad_viento);
                media_temp += resBase[i].temperatura;
                media_sensacion_ter += resBase[i].sensacion_termica;
                media_humedad += resBase[i].humedad;
                media_v_viento += resBase[i].velocidad_viento;
                media_presion += resBase[i].presion;
                media_capa_nubes += resBase[i].capa_nubes;
                media_precipitaciones += resBase[i].precipitacion;
                resBase[i].descripcion_tiempo = translateWeather(resBase[i].descripcion_tiempo);
            }
            data_medias = {
                "m_temperatura": Math.round((media_temp / resBase.length) * 100) / 100,
                "m_sensacion_termica": Math.round((media_sensacion_ter / resBase.length) * 100) / 100,
                "m_humedad": Math.round((media_humedad / resBase.length) * 100) / 100,
                "m_v_viento": Math.round((media_v_viento / resBase.length) * 100) / 100,
                "m_presion": Math.round((media_presion / resBase.length) * 100) / 100,
                "m_capa_nubes": Math.round((media_capa_nubes / resBase.length) * 100) / 100,
                "m_precipitacion": Math.round((media_precipitaciones / resBase.length) * 100) / 100
            };
        });
    ciudad_q = req.body.ciudad;
    climaConsulta.getClima(ciudad_q)
        .then(respuesta => {
            dataClima = respuesta;
            if (typeof dataClima === 'object') {
                let titulo_tablas = "Quito ,Ecuador";
                let fondo = getFondo(dataClima.Descripcion);
                const date = new Date(dataClima.Fecha);
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                dataClima.Fecha = date.toLocaleDateString('es-EC', options);
                let hora_api = date.getHours() + ":" + date.getMinutes();
                let max = max_time();
                let titulo_2 = "Desde " + resBase[4].hora_local.toLocaleString() + " hasta " + resBase[0].hora_local.toLocaleString();
                res.render('index', {
                    "respuesta": dataClima,
                    "tabla": resBase,
                    "fechas": fechas_base,
                    "temperaturas": temperaturas_base,
                    "sensaciones_termicas": sen_termica_base,
                    "presiones": presion_base,
                    "precipitaciones": precipitacion_base,
                    "humedades": humedad_base,
                    "capas_nubes": capa_nubes_base,
                    "velocidades_viento": v_viento_base,
                    "fondo": fondo,
                    "medias": data_medias,
                    "hora_api": hora_api,
                    "titulo": titulo_tablas,
                    "max": max,
                    "titulo_2": titulo_2,
                    "error": ""
                });
            } else {
                climaConsulta.getClima("Quito")
                    .then(respuesta => {
                        dataClima = respuesta;
                        let titulo_tablas = "Quito ,Ecuador";
                        let fondo = getFondo(dataClima.Descripcion);
                        const date = new Date(dataClima.Fecha);
                        const options = { weekday: 'long', month: 'long', day: 'numeric' };
                        dataClima.Fecha = date.toLocaleDateString('es-EC', options);
                        let hora_api = date.getHours() + ":" + date.getMinutes();
                        let max = max_time();
                        let titulo_2 = "Desde " + resBase[4].hora_local.toLocaleString() + " hasta " + resBase[0].hora_local.toLocaleString();
                        res.render('index', {
                            "respuesta": dataClima,
                            "tabla": resBase,
                            "fechas": fechas_base,
                            "temperaturas": temperaturas_base,
                            "sensaciones_termicas": sen_termica_base,
                            "presiones": presion_base,
                            "precipitaciones": precipitacion_base,
                            "humedades": humedad_base,
                            "capas_nubes": capa_nubes_base,
                            "velocidades_viento": v_viento_base,
                            "fondo": fondo,
                            "medias": data_medias,
                            "hora_api": hora_api,
                            "titulo": titulo_tablas,
                            "max": max,
                            "titulo_2": titulo_2,
                            "error": "No se encontró su ciudad"
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
        });
})

app.post('/consultaBase', (req, res) => {
    let inicio = req.body.fecha_inicio;
    let final = req.body.fecha_final;
    ciudad_q = req.body.provincia;
    if (ciudad_q === "Seleciona una Ciudad del Ecuador") {
        ciudad_q = "Quito";
    }
    Clima.find({
            ciudad: ciudad_q,
            hora_local: {
                $gte: inicio,
                $lte: final
            }
        })
        .sort({ hora_local: 1 })
        .exec((err, data) => {
            resBase = data;
            fechas_base = [];
            temperaturas_base = [];
            sen_termica_base = [];
            presion_base = [];
            precipitacion_base = [];
            humedad_base = [];
            capa_nubes_base = [];
            v_viento_base = [];
            let media_temp = 0;
            let media_sensacion_ter = 0
            let media_humedad = 0
            let media_v_viento = 0
            let media_presion = 0
            let media_capa_nubes = 0
            let media_precipitaciones = 0
            for (let i = 0; i < resBase.length; i++) {
                let date = new Date(resBase[i].hora_local);
                fechas_base.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes());
                let nueva_fecha = diaSemana(date);
                resBase[i].pais = capitalize(nueva_fecha);
                temperaturas_base.push(resBase[i].temperatura);
                sen_termica_base.push(resBase[i].sensacion_termica);
                presion_base.push(resBase[i].presion);
                precipitacion_base.push(resBase[i].precipitacion);
                humedad_base.push(resBase[i].humedad);
                capa_nubes_base.push(resBase[i].capa_nubes);
                v_viento_base.push(resBase[i].velocidad_viento);
                media_temp += resBase[i].temperatura;
                media_sensacion_ter += resBase[i].sensacion_termica;
                media_humedad += resBase[i].humedad;
                media_v_viento += resBase[i].velocidad_viento;
                media_presion += resBase[i].presion;
                media_capa_nubes += resBase[i].capa_nubes;
                media_precipitaciones += resBase[i].precipitacion;
                resBase[i].descripcion_tiempo = translateWeather(resBase[i].descripcion_tiempo);
            }
            data_medias = {
                "m_temperatura": Math.round((media_temp / resBase.length) * 100) / 100,
                "m_sensacion_termica": Math.round((media_sensacion_ter / resBase.length) * 100) / 100,
                "m_humedad": Math.round((media_humedad / resBase.length) * 100) / 100,
                "m_v_viento": Math.round((media_v_viento / resBase.length) * 100) / 100,
                "m_presion": Math.round((media_presion / resBase.length) * 100) / 100,
                "m_capa_nubes": Math.round((media_capa_nubes / resBase.length) * 100) / 100,
                "m_precipitacion": Math.round((media_precipitaciones / resBase.length) * 100) / 100
            };
        });
    climaConsulta.getClima(ciudad_q + ", Ecuador")
        .then(respuesta => {
            dataClima = respuesta;
            let titulo_tablas = dataClima.Ciudad;
            let date = new Date(dataClima.Fecha);
            let date_inicio = new Date(inicio);
            let date_final = new Date(final);
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dataClima.Fecha = date.toLocaleDateString('es-EC', options);
            let hora_api = date.getHours() + ":" + date.getMinutes();
            let max = max_time();
            let fondo = getFondo(dataClima.Descripcion);
            let titulo_2 = "Desde " + date_inicio.toLocaleString() + " hasta " + date_final.toLocaleString();
            res.render('index', {
                "respuesta": dataClima,
                "tabla": resBase,
                "fechas": fechas_base,
                "temperaturas": temperaturas_base,
                "sensaciones_termicas": sen_termica_base,
                "presiones": presion_base,
                "precipitaciones": precipitacion_base,
                "humedades": humedad_base,
                "capas_nubes": capa_nubes_base,
                "velocidades_viento": v_viento_base,
                "fondo": fondo,
                "medias": data_medias,
                "hora_api": hora_api,
                "titulo": titulo_tablas,
                "max": max,
                "titulo_2": titulo_2,
                "error": ""
            });
        })
        .catch(err => {
            console.log(err);
        });
})

//Metodo para subir archivo
app.post('/subir', upload.single('archivo'), (req, res) => {
    filename = req.file.filename;
    if (getFileExtension(filename) === 'csv') {
        subircsv(filename);
    }
    if (getFileExtension(filename) === 'json') {
        subirjson(filename);
    }
    if (getFileExtension(filename) === 'xml') {
        subirxml(filename);
    }
    if (getFileExtension(filename) === 'txt') {
        subirtxt(filename);
    }
    if (getFileExtension(filename) === 'xlsx') {
        subirxlsx(filename);
    }
    ciudad_q = "Quito";
    Clima.find({
            ciudad: ciudad_q,
        })
        .sort({ hora_local: -1 })
        .limit(5)
        .exec((err, data) => {
            resBase = data;
            fechas_base = [];
            temperaturas_base = [];
            sen_termica_base = [];
            presion_base = [];
            precipitacion_base = [];
            humedad_base = [];
            capa_nubes_base = [];
            v_viento_base = [];
            let media_temp = 0;
            let media_sensacion_ter = 0
            let media_humedad = 0
            let media_v_viento = 0
            let media_presion = 0
            let media_capa_nubes = 0
            let media_precipitaciones = 0
            for (let i = 0; i < resBase.length; i++) {
                let date = new Date(resBase[i].hora_local);
                fechas_base.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes());
                let nueva_fecha = diaSemana(date);
                resBase[i].pais = capitalize(nueva_fecha);
                temperaturas_base.push(resBase[i].temperatura);
                sen_termica_base.push(resBase[i].sensacion_termica);
                presion_base.push(resBase[i].presion);
                precipitacion_base.push(resBase[i].precipitacion);
                humedad_base.push(resBase[i].humedad);
                capa_nubes_base.push(resBase[i].capa_nubes);
                v_viento_base.push(resBase[i].velocidad_viento);
                media_temp += resBase[i].temperatura;
                media_sensacion_ter += resBase[i].sensacion_termica;
                media_humedad += resBase[i].humedad;
                media_v_viento += resBase[i].velocidad_viento;
                media_presion += resBase[i].presion;
                media_capa_nubes += resBase[i].capa_nubes;
                media_precipitaciones += resBase[i].precipitacion;
                resBase[i].descripcion_tiempo = translateWeather(resBase[i].descripcion_tiempo);
            }
            data_medias = {
                "m_temperatura": Math.round((media_temp / resBase.length) * 100) / 100,
                "m_sensacion_termica": Math.round((media_sensacion_ter / resBase.length) * 100) / 100,
                "m_humedad": Math.round((media_humedad / resBase.length) * 100) / 100,
                "m_v_viento": Math.round((media_v_viento / resBase.length) * 100) / 100,
                "m_presion": Math.round((media_presion / resBase.length) * 100) / 100,
                "m_capa_nubes": Math.round((media_capa_nubes / resBase.length) * 100) / 100,
                "m_precipitacion": Math.round((media_precipitaciones / resBase.length) * 100) / 100
            };
        });
    climaConsulta.getClima(ciudad_q)
        .then(respuesta => {
            dataClima = respuesta;
            let titulo_tablas = "Quito ,Ecuador";
            const date = new Date(dataClima.Fecha);
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dataClima.Fecha = date.toLocaleDateString('es-EC', options);
            let hora_api = date.getHours() + ":" + date.getMinutes();
            let max = max_time();
            let fondo = getFondo(dataClima.Descripcion);
            let titulo_2 = "Desde " + resBase[4].hora_local.toLocaleString() + " hasta " + resBase[0].hora_local.toLocaleString();
            res.render('index', {
                "respuesta": dataClima,
                "tabla": resBase,
                "fechas": fechas_base,
                "temperaturas": temperaturas_base,
                "sensaciones_termicas": sen_termica_base,
                "presiones": presion_base,
                "precipitaciones": precipitacion_base,
                "humedades": humedad_base,
                "capas_nubes": capa_nubes_base,
                "velocidades_viento": v_viento_base,
                "fondo": fondo,
                "medias": data_medias,
                "hora_api": hora_api,
                "titulo": titulo_tablas,
                "max": max,
                "titulo_2": titulo_2,
                "error": ""
            });
        })
        .catch(err => {
            console.log(err);
        });
})

function translateWeather(weather) {
    let des_weather;
    if (weather === "Partly cloudy") {
        des_weather = "Parcialmente nublado";
    }
    if (weather === "Moderate or heavy rain shower") {
        des_weather = "Lluvia moderada o fuerte";
    }
    if (weather === "Clear") {
        des_weather = "Claro";
    }
    if (weather === "Mist" || weather === "Fog" || weather === "Overcast") {
        des_weather = "Niebla";
    }
    if (weather === "Cloudy") {
        des_weather = "Nublado";
    }
    if (weather === "Light rain shower" || weather === "Patchy rain possible" || weather === "Patchy light drizzle") {
        des_weather = "Llovizna ligera";
    }
    if (weather === "Sunny") {
        des_weather = "Soleado";
    }
    if (weather === "Light rain" || weather === "Light drizzle" || weather === "Rain In Vicinity" || weather === "Light rain shower") {
        des_weather = "Lluvia ligera";
    }
    if (weather === "Light Rain With Thunderstorm") {
        des_weather = "Lluvia ligera con tormenta";
    }
    if (weather === "Torrential rain shower") {
        des_weather = "Lluvia torrencial";
    }
    if (weather === "Patchy light rain") {
        des_weather = "Lluvia ligera dispersa";
    }
    if (weather === "Patchy light rain with thunder") {
        des_weather = "Lluvia ligera irregular con truenos";
    }
    return des_weather;
}

function capitalize(word) {
    return word
        .toLowerCase()
        .replace(/\w/, firstLetter => firstLetter.toUpperCase());
}

function diaSemana(fecha) {
    let date = new Date(fecha);
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('es-MX', options) + " " + date.getHours() + ":" + date.getMinutes() + " hrs";
}

//Metodo para saber la extension de un documento
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function subirxlsx(filename) {
    const file = XLSX.readFile("./uploads/" + filename);
    let data = []

    const sheets = file.SheetNames

    for (let i = 0; i < sheets.length; i++) {
        const temp = XLSX.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
        temp.forEach((res) => {
            data.push(res)
        })
    }
    for (let j = 0; j < data.length; j++) {
        let clima = new Clima({
            ciudad: data[j].ciudad.replace(/['"]+/g, ''),
            pais: data[j].pais.replace(/['"]+/g, ''),
            latitud: data[j].latitud,
            longitud: data[j].longitud,
            hora_local: data[j].hora_local.replace(/['"]+/g, ''),
            temperatura: data[j].temperatura,
            descripcion_tiempo: data[j].descripcion_tiempo.replace(/['"]+/g, ''),
            velocidad_viento: data[j].velocidad_viento,
            grado_viento: data[j].grado_viento,
            direccion_viento: data[j].direccion_viento.replace(/['"]+/g, ''),
            presion: data[j].presion,
            precipitacion: data[j].precipitacion,
            humedad: data[j].humedad,
            capa_nubes: data[j].capa_nubes,
            sensacion_termica: data[j].sensacion_termica,
            visibilidad: data[j].visibilidad
        });
        clima.save((err, climaDB) => {
            if (err) throw err;
        });
    }
    fs.unlink("./uploads/" + filename, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function subirtxt(filename) {
    let dataInJSON = txtToJson({ filePath: "./uploads/" + filename });
    for (let i = 0; i < dataInJSON.length; i++) {
        let clima = new Clima({
            ciudad: dataInJSON[i].ciudad.replace(/['"]+/g, ''),
            pais: dataInJSON[i].pais.replace(/['"]+/g, ''),
            latitud: dataInJSON[i].latitud,
            longitud: dataInJSON[i].longitud,
            hora_local: dataInJSON[i].hora_local.replace(/['"]+/g, ''),
            temperatura: dataInJSON[i].temperatura,
            descripcion_tiempo: dataInJSON[i].descripcion_tiempo.replace(/['"]+/g, ''),
            velocidad_viento: dataInJSON[i].velocidad_viento,
            grado_viento: dataInJSON[i].grado_viento,
            direccion_viento: dataInJSON[i].direccion_viento.replace(/['"]+/g, ''),
            presion: dataInJSON[i].presion,
            precipitacion: dataInJSON[i].precipitacion,
            humedad: dataInJSON[i].humedad,
            capa_nubes: dataInJSON[i].capa_nubes,
            sensacion_termica: dataInJSON[i].sensacion_termica,
            visibilidad: dataInJSON[i].visibilidad
        });
        clima.save((err, climaDB) => {
            if (err) throw err;
        });
    }
    fs.unlink("./uploads/" + filename, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function subirjson(filename) {
    fs.readFile('./uploads/' + filename, (err, data) => {
        if (err) throw err;
        let datajson = JSON.parse(data);
        for (let i = 0; i < datajson.length; i++) {
            let clima = new Clima({
                ciudad: datajson[i].ciudad,
                pais: datajson[i].pais,
                latitud: datajson[i].latitud,
                longitud: datajson[i].longitud,
                hora_local: datajson[i].hora_local,
                temperatura: datajson[i].temperatura,
                descripcion_tiempo: datajson[i].descripcion_tiempo,
                velocidad_viento: datajson[i].velocidad_viento,
                grado_viento: datajson[i].grado_viento,
                direccion_viento: datajson[i].direccion_viento,
                presion: datajson[i].presion,
                precipitacion: datajson[i].precipitacion,
                humedad: datajson[i].humedad,
                capa_nubes: datajson[i].capa_nubes,
                sensacion_termica: datajson[i].sensacion_termica,
                visibilidad: datajson[i].visibilidad
            });
            clima.save((err, climaDB) => {
                if (err) throw err;
            });
        }
    });
    fs.unlink('./uploads/' + filename, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function subirxml(filename) {

    let xml = require('fs').readFileSync('./uploads/' + filename, 'utf8');
    var result = convert.xml2json(xml, { compact: true, spaces: 4 });
    var js = JSON.parse(result);
    for (let i = 0; i < js.ArrayOfRoute.Route.length; i++) {
        let clima = new Clima({
            ciudad: js.ArrayOfRoute.Route[i].ciudad._text,
            pais: js.ArrayOfRoute.Route[i].pais._text,
            latitud: js.ArrayOfRoute.Route[i].latitud._text,
            longitud: js.ArrayOfRoute.Route[i].longitud._text,
            hora_local: js.ArrayOfRoute.Route[i].hora_local._text,
            temperatura: js.ArrayOfRoute.Route[i].temperatura._text,
            descripcion_tiempo: js.ArrayOfRoute.Route[i].descripcion_tiempo._text,
            velocidad_viento: js.ArrayOfRoute.Route[i].velocidad_viento._text,
            grado_viento: js.ArrayOfRoute.Route[i].grado_viento._text,
            direccion_viento: js.ArrayOfRoute.Route[i].direccion_viento._text,
            presion: js.ArrayOfRoute.Route[i].presion._text,
            precipitacion: js.ArrayOfRoute.Route[i].precipitacion._text,
            humedad: js.ArrayOfRoute.Route[i].humedad._text,
            capa_nubes: js.ArrayOfRoute.Route[i].capa_nubes._text,
            sensacion_termica: js.ArrayOfRoute.Route[i].sensacion_termica._text,
            visibilidad: js.ArrayOfRoute.Route[i].visibilidad._text
        });
        clima.save((err, climaDB) => {
            if (err) throw err;
        });
    }
    fs.unlink("./uploads/" + filename, (err) => {
        if (err) {
            console.log(err);
        }
    });
}


function subircsv(filename) {
    fs.createReadStream('./uploads/' + filename)
        .pipe(csv())
        .on('data', (row) => {
            //Aqui va el insert a la base
            let clima = new Clima({
                ciudad: row.ciudad.replace(/['"]+/g, ''),
                pais: row.pais.replace(/['"]+/g, ''),
                latitud: row.latitud.replace(/['"]+/g, ''),
                longitud: row.longitud.replace(/['"]+/g, ''),
                hora_local: row.hora_local.replace(/['"]+/g, ''),
                temperatura: row.temperatura.replace(/['"]+/g, ''),
                descripcion_tiempo: row.descripcion_tiempo.replace(/['"]+/g, ''),
                velocidad_viento: row.velocidad_viento.replace(/['"]+/g, ''),
                grado_viento: row.grado_viento.replace(/['"]+/g, ''),
                direccion_viento: row.direccion_viento.replace(/['"]+/g, ''),
                presion: row.presion.replace(/['"]+/g, ''),
                precipitacion: row.precipitacion.replace(/['"]+/g, ''),
                humedad: row.humedad.replace(/['"]+/g, ''),
                capa_nubes: row.capa_nubes.replace(/['"]+/g, ''),
                sensacion_termica: row.sensacion_termica.replace(/['"]+/g, ''),
                visibilidad: row.visibilidad.replace(/['"]+/g, '')
            });
            clima.save((err, climaDB) => {
                if (err) throw err;
            });
        })
        .on('end', () => {
            fs.unlinkSync('./uploads/' + filename);
        });
}

function getFondo(tipo) {
    let fondo = "";
    if (tipo === "Partly cloudy") {
        fondo = "nublado_2.jpg";
    } else if (tipo === "Moderate or heavy rain shower") {
        fondo = "Lluvia_moderada_o_fuerte.png";
    } else if (tipo === "Clear") {
        fondo = "clear.jpg";
    } else if (tipo === "Mist" || tipo === "Fog" || tipo === "Overcast") {
        fondo = "niebla.jpg";
    } else if (tipo === "Cloudy") {
        fondo = "nublado.jpg";
    } else if (tipo === "Light rain shower" || tipo === "Patchy rain possible" || tipo === "Patchy light drizzle") {
        fondo = "Llovizna_ligera.jpg";
    } else if (tipo === "Sunny") {
        fondo = "soleado.jpg";
    } else if (tipo === "Light rain" || tipo === "Light drizzle" || tipo === "Rain In Vicinity") {
        fondo = "Lluvia_en_las_inmediaciones.png";
    } else if (tipo === "Light Rain With Thunderstorm") {
        fondo = "Lluvia_ligera_con_tormenta.png";
    } else if (tipo === "Torrential rain shower") {
        fondo = "Lluvia_torrencial.png";
    } else {
        fondo = "general.jpg";
    }
    return fondo;
}

function max_time() {
    //Setear el maximo de la fecha
    let today = new Date();
    let anio = today.getFullYear();
    let mes = (today.getMonth() + 1);
    let dia = today.getDate();
    let strmes = mes.toString();
    let strdia = dia.toString();
    if (strmes.length === 1) {
        mes = "0" + mes;
    }
    if (strdia.length === 1) {
        dia = "0" + dia;
    }
    let result = anio + "-" + mes + "-" + dia + "T" + today.getHours() + ":" + today.getMinutes() + ":00";
    return result;
}

app.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto: ", process.env.PORT);
});

mongoose.connect(
    process.env.URLDB, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true },

    (err, res) => {
        if (err) throw err;

        console.log("Base de datos ONLINE!");
    }
);