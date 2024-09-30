class BinaryMinHeap {
    constructor() {
        this.heap = [];
        this.priorityMap = { 'Baja': 1, 'Media': 2, 'Alta': 3 };
    }

    insert(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.comparePriority(this.heap[parentIndex].prioridad, this.heap[index].prioridad) <= 0) break;
            
            // Swap
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    extractMin() {
        if (this.heap.length === 1) return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    bubbleDown(index) {
        let lastIndex = this.heap.length - 1;
        while (index < lastIndex) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild <= lastIndex && this.comparePriority(this.heap[leftChild].prioridad, this.heap[smallest].prioridad) < 0) {
                smallest = leftChild;
            }

            if (rightChild <= lastIndex && this.comparePriority(this.heap[rightChild].prioridad, this.heap[smallest].prioridad) < 0) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }

    comparePriority(priority1, priority2) {
        return this.priorityMap[priority1] - this.priorityMap[priority2];
    }

    size() {
        return this.heap.length;
    }
}

module.exports = BinaryMinHeap;
