class NodoTarea {
    constructor(tarea) {
        this.tarea = tarea;   // Información de la tarea (descripción, fecha, prioridad, etc.)
        this.aristas = new Map(); // Relaciones con otras tareas (conexiones)
    }

    // Agregar una arista a otro nodo
    agregarArista(nodoDestino, peso) {
        this.aristas.set(nodoDestino, peso);
    }
}

class GrafoTareas {
    constructor() {
        this.nodos = new Map();  // Almacena las tareas (nodos)
    }

    // Añadir una nueva tarea al grafo
    agregarTarea(tarea) {
        const nodoTarea = new NodoTarea(tarea);
        this.nodos.set(tarea._id, nodoTarea);
    }

    // Conectar dos tareas
    conectarTareas(tareaOrigen, tareaDestino, peso) {
        const nodoOrigen = this.nodos.get(tareaOrigen._id);
        const nodoDestino = this.nodos.get(tareaDestino._id);

        if (nodoOrigen && nodoDestino) {
            nodoOrigen.agregarArista(nodoDestino, peso);
        }
    }
    

    // Eliminar una tarea del grafo, junto con sus conexiones
    eliminarTarea(idTarea) {
        // Verificar si el nodo existe
        if (this.nodos.has(idTarea)) {
            const nodoAEliminar = this.nodos.get(idTarea);

            // Eliminar todas las conexiones hacia este nodo
            this.nodos.forEach(nodo => {
                if (nodo.aristas.has(nodoAEliminar)) {
                    nodo.aristas.delete(nodoAEliminar);  // Eliminar la arista que conecte a este nodo
                }
            });

            // Eliminar el nodo de la lista de nodos
            this.nodos.delete(idTarea);
        }
    }



    // Obtener la tarea más cercana a la fecha actual
    recomendarTarea(fechaActual) {
        let tareaRecomendada = null;
        let fechaMasCercana = Infinity;

        // Recorrer todos los nodos del grafo
        this.nodos.forEach((nodoTarea) => {
            const fechaVencimiento = new Date(nodoTarea.tarea.fechaVencimiento).getTime();
            const fechaActualMs = new Date(fechaActual).getTime();

            if (fechaVencimiento >= fechaActualMs && fechaVencimiento < fechaMasCercana) {
                fechaMasCercana = fechaVencimiento;
                tareaRecomendada = nodoTarea.tarea;
            }
        });

        return tareaRecomendada;
    }
}

module.exports = GrafoTareas;
