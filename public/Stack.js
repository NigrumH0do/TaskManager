class Stack {
  constructor() {
      this.stack = [];
  }

  // Añadir una tarea a la pila
  push(item) {
      this.stack.push(item);
  }

  // Remover y devolver la última tarea añadida
  pop() {
      return this.stack.pop();
  }

  // Ver la última tarea sin removerla
  peek() {
      return this.stack[this.stack.length - 1];
  }

  // Verificar si la pila está vacía
  isEmpty() {
      return this.stack.length === 0;
  }
}

module.exports = Stack;
