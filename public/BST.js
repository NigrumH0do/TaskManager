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
        // Comparar las fechas de vencimiento
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

    findMin(root = this.root) {
        if (!root) {
            return null;
        }
        while (root.left !== null) {
            root = root.left;
        }
        return root.data;
    }
}

module.exports = BST;
