let callbacks = {};

let generateID = () => {
    var id = Date.now();

    if (id <= generateID.previous) {
        id = ++generateID.previous;
    } else {
        generateID.previous = id;
    }

    if(generateID.previous === Number.MAX_SAFE_INTEGER){generateID.previous = 0};

    return "cb" + id;
}

module.exports = {
    set: (callback) => {
        let id = generateID();
        callbacks[id] = callback;
        return id;
    },
    get: (id) => {return callbacks[id]}
};
