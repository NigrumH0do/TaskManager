class QuaternaryMaxHeap {
    constructor() {
        this.heap = [];
    }

    // Obtener el índice del padre
    parent(index) {
        return Math.floor((index - 1) / 4);
    }

    // Obtener los índices de los hijos
    child1(index) {
        return 4 * index + 1;
    }

    child2(index) {
        return 4 * index + 2;
    }

    child3(index) {
        return 4 * index + 3;
    }

    child4(index) {
        return 4 * index + 4;
    }

    // Intercambiar dos elementos en el heap
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    // Insertar un nuevo valor en el heap
    insert(value) {
        this.heap.push(value);
        this.heapifyUp(this.heap.length - 1);
    }

    // Mover hacia arriba para mantener la propiedad del heap
    heapifyUp(index) {
        let currentIndex = index;
        let parentIndex = this.parent(currentIndex);

        while (
            currentIndex > 0 &&
            this.heap[currentIndex].prioridad > this.heap[parentIndex].prioridad
        ) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.parent(currentIndex);
        }
    }

    // Extraer el valor máximo (en la raíz)
    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);

        return root;
    }

    // Mover hacia abajo para mantener la propiedad del heap
    heapifyDown(index) {
        let currentIndex = index;
        let largestIndex = index;

        const child1Index = this.child1(currentIndex);
        const child2Index = this.child2(currentIndex);
        const child3Index = this.child3(currentIndex);
        const child4Index = this.child4(currentIndex);

        if (
            child1Index < this.heap.length &&
            this.heap[child1Index].prioridad > this.heap[largestIndex].prioridad
        ) {
            largestIndex = child1Index;
        }

        if (
            child2Index < this.heap.length &&
            this.heap[child2Index].prioridad > this.heap[largestIndex].prioridad
        ) {
            largestIndex = child2Index;
        }

        if (
            child3Index < this.heap.length &&
            this.heap[child3Index].prioridad > this.heap[largestIndex].prioridad
        ) {
            largestIndex = child3Index;
        }

        if (
            child4Index < this.heap.length &&
            this.heap[child4Index].prioridad > this.heap[largestIndex].prioridad
        ) {
            largestIndex = child4Index;
        }

        if (largestIndex !== currentIndex) {
            this.swap(currentIndex, largestIndex);
            this.heapifyDown(largestIndex);
        }
    }
}

module.exports = QuaternaryMaxHeap;