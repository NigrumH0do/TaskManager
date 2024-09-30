class HashTable {
    constructor() {
        this.table = new Map();
    }

    set(key, value) {
        const dateKey = new Date(key).getTime();
        this.table.set(dateKey, value);
    }

    getClosestAfter(currentDate) {
        const currentDateKey = new Date(currentDate).getTime();
        let closestTask = null;
        let closestDate = Infinity;

        for (let [dateKey, task] of this.table.entries()) {
            if (dateKey >= currentDateKey && dateKey < closestDate) {
                closestDate = dateKey;
                closestTask = task;
            }
        }

        return closestTask;
    }

    delete(key) {
        const dateKey = new Date(key).getTime();
        this.table.delete(dateKey);
    }
}

module.exports = HashTable;
