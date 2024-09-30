class ConjuntosDisjuntos {
    constructor() {
        this.padre = {};
    }

    // Inicializa una tarea como su propio conjunto
    makeSet(tareaId) {
        this.padre[tareaId] = tareaId;
    }

    // Encuentra el representante del conjunto
    find(tareaId) {
        if (this.padre[tareaId] !== tareaId) {
            this.padre[tareaId] = this.find(this.padre[tareaId]); // Compresión de caminos
        }
        return this.padre[tareaId];
    }

    // Une dos conjuntos
    union(tareaId1, tareaId2) {
        const root1 = this.find(tareaId1);
        const root2 = this.find(tareaId2);
        if (root1 !== root2) {
            this.padre[root2] = root1; // Unión por rango no necesaria si solo es unión básica
        }
    }
}


module.exports = ConjuntosDisjuntos;