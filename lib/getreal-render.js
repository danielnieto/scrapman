const {ipcRenderer} = require("electron");

//get the 'section' DOM element that will hold all dynamically created <webview> tags
let webviewsContainer = document.querySelector("#webviewsContainer");

let createWebview = (opts = {}) =>{
    let webview = document.createElement("webview");

    if(!opts.show){
        webview.style.visibility = "hidden";
        webview.style.display = "inline-flex";
        webview.style.position = "absolute";
        webview.style.width = "0";
        webview.style.height = "0";
    }

    webview.setAttribute("preload", "inyector.js");

    webviewsContainer.appendChild(webview);

    return webview;
}

let removeWebview = (webview) => {
    webviewsContainer.removeChild(webview);
}

let load = (url, cb, opts) => {

    //create and add new instance of webview
    let webview = createWebview({show: false});

    //make webview navigate to desired URL
    webview.setAttribute("src", url);

    webview.addEventListener("ipc-message", function(event){

        //remove the event so it gets called just once
        event.target.removeEventListener(event.type, arguments.callee);

        //remove the <webview> from container
        removeWebview(webview);

        //event.channel contains the whole HTML of the document loaded
        cb(event.channel);

    });

}

ipcRenderer.on("getreal-load", function(event, url){

    load(url, (html)=>{
        event.sender.send("getreal-load", html);
    });

})
