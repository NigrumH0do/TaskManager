class Node {
    constructor(data, left = null, right = null, height = 1) {
        this.data = data;
        this.left = left;
        this.right = right;
        this.height = height;
    }
}

class AVL {
    constructor() {
        this.root = null;
    }

    // Función para obtener la altura de un nodo
    getHeight(node) {
        return node ? node.height : 0;
    }

    // Función para calcular el balanceo de un nodo
    getBalanceFactor(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    // Rotación a la derecha
    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
    }

    // Rotación a la izquierda
    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    // Insertar un nodo en el árbol AVL
    insert(data) {
        this.root = this.insertNode(this.root, data);
    }

    insertNode(node, data) {
        if (node === null) {
            return new Node(data);
        }

        // Comparar las fechas de vencimiento
        if (new Date(data.fechaVencimiento) < new Date(node.data.fechaVencimiento)) {
            node.left = this.insertNode(node.left, data);
        } else if (new Date(data.fechaVencimiento) > new Date(node.data.fechaVencimiento)) {
            node.right = this.insertNode(node.right, data);
        } else {
            return node; // Las fechas de vencimiento son iguales, no se inserta el duplicado
        }

        // Actualizar la altura del nodo actual
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // Obtener el factor de balance de este nodo
        const balanceFactor = this.getBalanceFactor(node);

        // Si el nodo se desbalancea, entonces hay 4 casos posibles

        // Caso izquierda izquierda
        if (balanceFactor > 1 && new Date(data.fechaVencimiento) < new Date(node.left.data.fechaVencimiento)) {
            return this.rightRotate(node);
        }

        // Caso derecha derecha
        if (balanceFactor < -1 && new Date(data.fechaVencimiento) > new Date(node.right.data.fechaVencimiento)) {
            return this.leftRotate(node);
        }

        // Caso izquierda derecha
        if (balanceFactor > 1 && new Date(data.fechaVencimiento) > new Date(node.left.data.fechaVencimiento)) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Caso derecha izquierda
        if (balanceFactor < -1 && new Date(data.fechaVencimiento) < new Date(node.right.data.fechaVencimiento)) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    // Encontrar el nodo con el valor mínimo (fecha más próxima a vencer)
    findMin(node = this.root) {
        if (node.left === null) {
            return node.data;
        } else {
            return this.findMin(node.left);
        }
    }
}

module.exports = AVL;
