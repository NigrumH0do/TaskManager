class PriorityQueue {
    constructor() {
      this.items = [];
    }
  
    /**
     * Agrega un elemento a la cola con la prioridad especificada
     * @param {*} item - El elemento a agregar
     * @param {number} priority - La prioridad del elemento (0 es la máxima prioridad)
     */
    enqueue(item, priority) {
      const queueItem = { item, priority };
  
      // Coloca el elemento en la posición correcta según su prioridad
      let insertIndex = this.items.findIndex(
        (el) => queueItem.priority < el.priority
      );
      if (insertIndex === -1) {
        this.items.push(queueItem);
      } else {
        this.items.splice(insertIndex, 0, queueItem);
      }
    }
  
    /**
     * Elimina y devuelve el elemento con la máxima prioridad de la cola
     * @returns {*} El elemento con la máxima prioridad
     */
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift().item;
    }
  
    /**
     * Devuelve el elemento con la máxima prioridad sin eliminarlo de la cola
     * @returns {*} El elemento con la máxima prioridad
     */
    peek() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items[0].item;
    }
  
    /**
     * Verifica si la cola está vacía
     * @returns {boolean} true si la cola está vacía, false de lo contrario
     */
    isEmpty() {
      return this.items.length === 0;
    }
  
    /**
     * Obtiene la longitud de la cola
     * @returns {number} La longitud de la cola
     */
    size() {
      return this.items.length;
    }
  }
  
module.exports = PriorityQueue;