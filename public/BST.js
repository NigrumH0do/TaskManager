class Node {
    constructor(data, left = null, right = null) {
        this.data = data;
        this.left = left;
        this.right = right;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(data) {
        const node = new Node(data);
        if (this.root === null) {
            this.root = node;
        } else {
            this.insertNode(this.root, node);
        }
    }

    insertNode(root, node) {
        if (new Date(node.data.fechaVencimiento) < new Date(root.data.fechaVencimiento)) {
            if (root.left === null) {
                root.left = node;
            } else {
                this.insertNode(root.left, node);
            }
        } else {
            if (root.right === null) {
                root.right = node;
            } else {
                this.insertNode(root.right, node);
            }
        }
    }

    // Método para obtener las tareas en orden descendente
    inorderDesc(node = this.root, result = []) {
        if (node !== null) {
            this.inorderDesc(node.right, result); // Primero visita el nodo derecho
            result.push(node.data); // Luego la raíz
            this.inorderDesc(node.left, result); // Finalmente el nodo izquierdo
        }
        return result;
    }

    // Método para obtener las tareas en orden ascendente
    inorderAsc(node = this.root, result = []) {
        if (node !== null) {
            this.inorderAsc(node.left, result); // Primero visita el nodo izquierdo
            result.push(node.data); // Luego la raíz
            this.inorderAsc(node.right, result); // Finalmente el nodo derecho
        }
        return result;
    }
}

module.exports = BST;
