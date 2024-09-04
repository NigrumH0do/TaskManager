class DisjointSetOptimized {
    constructor(size) {
        this.parents = new Array(size).fill(0).map((_, index) => index);
        this.rank = new Array(size).fill(0);
    }

    find(x) {
        if (this.parents[x] !== x) {
            this.parents[x] = this.find(this.parents[x]); // Compresión de ruta
        }
        return this.parents[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX !== rootY) {
            if (this.rank[rootX] > this.rank[rootY]) {
                this.parents[rootY] = rootX;
            } else if (this.rank[rootX] < this.rank[rootY]) {
                this.parents[rootX] = rootY;
            } else {
                this.parents[rootY] = rootX;
                this.rank[rootX] += 1; // Unión por rango
            }
        }
    }
}

module.exports = DisjointSetOptimized;