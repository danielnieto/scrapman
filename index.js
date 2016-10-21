"use strict"

const path = require("path");
const spawn = require("child_process").spawn
const electronPath = require("electron");


var scrapmanPath = path.join(__dirname, './lib/scrapman.js');

let child = spawn(electronPath, [scrapmanPath], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
let scrapmanIsReady = false;
let onceReadyActionsQueue = [];
let actionsQueue = [];
let maxConcurrentOperations = 50;
let currentConcurrentOperations = 0;

const ipcManager_parent = require("ipc-messages-manager").parent;

ipcManager_parent.send(child, "notify-when-ready", null, function() {
    scrapmanIsReady = true;
    executeOnceReadyQueue();
});

// add action to once ready queue
let queueOnceReadyAction = (action, params, callback) => {
    onceReadyActionsQueue.push({ action, params, callback });
}

let executeOnceReadyQueue = () => {
    // execute all pending actions, this will be executed once the "scrapman"(Electron) instance is ready
    onceReadyActionsQueue.forEach((action) => {
        // try to send the message to the child
        executeAction(action.action, action.params, action.callback);
    });

    // clean up the queue
    onceReadyActionsQueue = [];
}

let executeRemainingQueuedActions = () => {
    if(actionsQueue.length > 0){
        let queuedAction = actionsQueue.shift();
        executeAction(queuedAction.action, queuedAction.params, queuedAction.callback);
    }
}

//this function limits concurrent execution of several actions,
//to prevent the Three Stooges Syndrome (clogging above 50 concurrent operations)
let executeAction = (action, params, callback) => {
    // check if more concurrent operations can be executed
    if(currentConcurrentOperations < maxConcurrentOperations){

        // increment the "councurrent operations" counter
        currentConcurrentOperations++;

        // send the actual message to the child
        ipcManager_parent.send(child, action, params, function(results){
            callback(results);
            // once this concurrent operation finished, decrement the "concurrent oprations" counter
            currentConcurrentOperations--;
            // if there are pending operations on queue to be performed, then process them.
            executeRemainingQueuedActions();
        });

    }else{
        // all concurrent slots are occupied, queue this operation.
        actionsQueue.push({action, params, callback});
    }
}

let load = (url, callback) => {
    if (scrapmanIsReady) {
        // if scrapman instance is ready, try to send the action to the child
        executeAction("load", {url}, callback);
    } else {
        // if the scrapman instance is not ready yet, then add the function
        // to the queue that will get executed once it's ready
        queueOnceReadyAction("load", {url}, callback);
    }
}

module.exports = {
    load
}
