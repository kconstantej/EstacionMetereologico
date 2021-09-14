const mogoose = require('mongoose');
let Schema = mogoose.Schema;

let climaSchema = new Schema({
    ciudad: {
        type: String,
        required: [true, 'La Ciudad es requerida']
    },
    pais: {
        type: String,
        required: [true, 'La Pais es requerido']
    },
    latitud: {
        type: Number,
        required: [true, 'La latitud es requerida']
    },
    longitud: {
        type: Number,
        required: [true, 'La latitud es requerida']
    },
    hora_local: {
        type: Date,
        required: [true, 'La hora es requerida']
    },
    temperatura: {
        type: Number,
        required: [true, 'La temperatura es requerida']
    },
    descripcion_tiempo: {
        type: String,
        required: [true, 'La descripcion del tiempo es requerida']
    },
    velocidad_viento: {
        type: Number,
        required: [true, 'La velocidad del viento es requerida']
    },
    grado_viento: {
        type: Number,
        required: [true, 'El grado del viento es requerido']
    },
    direccion_viento: {
        type: String,
        required: [true, 'La direccion del viento es requerida']
    },
    presion: {
        type: Number,
        required: [true, 'La presion es requerida']
    },
    precipitacion: {
        type: Number,
        required: [true, 'La precipitacion es requerida']
    },
    humedad: {
        type: Number,
        required: [true, 'La humedad es requerida']
    },
    capa_nubes: {
        type: Number,
        required: [true, 'La capa de nubes es requerida']
    },
    sensacion_termica: {
        type: Number,
        required: [true, 'La sensacion termica es requerida']
    },
    visibilidad: {
        type: Number,
        required: [true, 'La visibilidad es requerida']
    }
});

module.exports = mogoose.model('Clima', climaSchema);