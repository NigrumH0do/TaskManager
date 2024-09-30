// Mapeo de prioridades a valores numéricos
const prioridadValores = {
    "Baja": 1,
    "Media": 2,
    "Alta": 3
};

class BinaryMaxHeap {
    constructor() {
        this.heap = [];
    }

    // Insertar tarea en el heap
    insert(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    // Subir el elemento si es mayor que su padre
    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);

            // Comparar usando los valores mapeados de prioridad
            if (prioridadValores[this.heap[parentIndex].prioridad] >= prioridadValores[this.heap[index].prioridad]) break;
            
            // Intercambiar
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    // Extraer el elemento de mayor prioridad
    extractMax() {
        if (this.heap.length === 1) return this.heap.pop();
        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return max;
    }

    // Bajar el elemento si es menor que alguno de sus hijos
    bubbleDown(index) {
        let lastIndex = this.heap.length - 1;
        while (index < lastIndex) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let largest = index;

            // Comparar hijos usando los valores mapeados de prioridad
            if (leftChild <= lastIndex && prioridadValores[this.heap[leftChild].prioridad] > prioridadValores[this.heap[largest].prioridad]) {
                largest = leftChild;
            }

            if (rightChild <= lastIndex && prioridadValores[this.heap[rightChild].prioridad] > prioridadValores[this.heap[largest].prioridad]) {
                largest = rightChild;
            }

            if (largest !== index) {
                [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
                index = largest;
            } else {
                break;
            }
        }
    }

    // Obtener el tamaño del heap
    size() {
        return this.heap.length;
    }
}

module.exports = BinaryMaxHeap;
