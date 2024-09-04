class BinaryMaxHeap {
    constructor() {
        this.heap = [];
    }

    insert(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].prioridad >= this.heap[index].prioridad) break;
            
            // Swap
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    extractMax() {
        if (this.heap.length === 1) return this.heap.pop();
        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return max;
    }

    bubbleDown(index) {
        let lastIndex = this.heap.length - 1;
        while (index < lastIndex) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let largest = index;

            if (leftChild <= lastIndex && this.heap[leftChild].prioridad > this.heap[largest].prioridad) {
                largest = leftChild;
            }

            if (rightChild <= lastIndex && this.heap[rightChild].prioridad > this.heap[largest].prioridad) {
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

    size() {
        return this.heap.length;
    }
}

module.exports = BinaryMaxHeap;