const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tareaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    fechaCreacion: {
        type: Date,
        required: [true, 'La fecha de creación es requerida'],
        default: Date.now()
    },
    fechaVencimiento: {
        type: Date,
        required: [true, 'La fecha de vencimiento es requerida']
    },
    prioridad: {
        type: Number,
        required: [true, 'La prioridad es requerida']
    },
    completado: {
        type: Boolean,
        required: [true, 'El estado de la tarea es requerido'],
        default: false
    }
});

// crear modelo
const Tarea = mongoose.model('Tarea', tareaSchema);

module.exports = Tarea;