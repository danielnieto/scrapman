const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    ipcRenderer.sendToHost(document.documentElement.outerHTML);
}, false);
