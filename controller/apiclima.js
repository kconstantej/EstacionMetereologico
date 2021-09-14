const axios = require('axios');

const apikey = '32030e015cdf9bf639d86120f39a4dda';
let data;
const getClima = async(ciudad) => {
    try {
        const ciudadURI = encodeURI(ciudad);
        const respuesta = await axios.get(`http://api.weatherstack.com/current?access_key=${apikey}&query=${ciudadURI}`);
        data = {
            "Ciudad": respuesta.data.location.name + " ," + respuesta.data.location.country,
            "Temperatura": respuesta.data.current.temperature,
            "Fecha": respuesta.data.location.localtime,
            "Termica": respuesta.data.current.feelslike,
            "Humedad": respuesta.data.current.humidity,
            "Icono": respuesta.data.current.weather_icons[0],
            "Descripcion": respuesta.data.current.weather_descriptions[0],
            "V_viento": respuesta.data.current.wind_speed,
            "Presion": respuesta.data.current.pressure,
            "Precipitacion": respuesta.data.current.precip,
            "Capa_nubes": respuesta.data.current.cloudcover,

            "ciudad_bd": respuesta.data.location.name,
            "pais_bd": respuesta.data.location.country,
            "latitud_bd": respuesta.data.location.lat,
            "longitud_bd": respuesta.data.location.lon,
            "hora_local_bd": respuesta.data.location.localtime,
            "temperatura_bd": respuesta.data.current.temperature,
            "descripcion_tiempo_bd": respuesta.data.current.weather_descriptions[0],
            "velocidad_viento_bd": respuesta.data.current.wind_speed,
            "grado_viento_bd": respuesta.data.current.wind_degree,
            "direccion_viento_bd": respuesta.data.current.wind_dir,
            "presion_bd": respuesta.data.current.pressure,
            "precipitacion_bd": respuesta.data.current.precip,
            "humedad_bd": respuesta.data.current.humidity,
            "capa_nubes_bd": respuesta.data.current.cloudcover,
            "sensacion_termica_bd": respuesta.data.current.feelslike,
            "visibilidad_bd": respuesta.data.current.visibility
        };
        return data;
    } catch (error) {
        console.log(error.data);
    }
}

module.exports = {
    getClima
}