class DisjointSetWithPathCompression {
    constructor(size) {
        this.parent = new Array(size).fill(0).map((_, index) => index);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);  // Compresión de ruta
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX !== rootY) {
            this.parent[rootY] = rootX;  // Unir los conjuntos
        }
    }

    printSets() {
        console.log("Conjuntos:");
        for (let i = 0; i < this.parent.length; i++) {
            console.log(`Elemento: ${i}, Conjunto: ${this.find(i)}`);
        }
    }
}

module.exports = DisjointSetWithPathCompression;