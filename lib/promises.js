/*jshint esversion: 6*/
/*jshint node: true*/
"use strict";

let promises = {};

let generateID = require("unique-id-generator");

module.exports = {
    set: (promise) => {
        let id = generateID({prefix:"pr"});
        promises[id] = promise;
        return id;
    },
    get: (id) => promises[id],
    remove: (id) => { delete promises[id]; },
    log: ()=>{console.log("promises: " + JSON.stringify(promises));}
};
