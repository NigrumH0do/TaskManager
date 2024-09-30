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
        type: String,
        required: [true, 'La prioridad es requerida'],
        enum: ['Alta', 'Media', 'Baja'] // Solo permite estos valores
    },
    completado: {
        type: Boolean,
        required: [true, 'El estado de la tarea es requerido'],
        default: false
    },
    // Si la tarea es una subtarea, este campo hace referencia a la tarea padre
    tareaPadre: {
        type: Schema.Types.ObjectId,
        ref: 'Tarea',
        default: null // Si no tiene un padre, entonces es una tarea principal
    }
});

// crear modelo
const Tarea = mongoose.model('Tarea', tareaSchema);

module.exports = Tarea;
