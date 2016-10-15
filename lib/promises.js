let promises = {};

let generateID = () => {
    var id = Date.now();

    if (id <= generateID.previous) {
        id = ++generateID.previous;
    } else {
        generateID.previous = id;
    }

    if(generateID.previous === Number.MAX_SAFE_INTEGER){generateID.previous = 0};

    return "pr" + id;
}

module.exports = {
    set: (promise) => {
        let id = generateID();
        promises[id] = promise;
        return id;
    },
    get: (id) => promises[id],
    remove: (id) => { delete promises[id] },
    log: ()=>{console.log("promises: " + JSON.stringify(promises))}
};
