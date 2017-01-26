const {ipcRenderer, remote} = require("electron");

//get the 'section' DOM element that will hold all dynamically created <webview> tags
let webviewsContainer = document.querySelector("#webviewsContainer");
let promises = remote.require("./promises.js");

//add new <webview> tag in the main window
let createWebview = (opts = {}) => {
    let webview = document.createElement("webview");
    // set all css rules to hide the webview
    if (!opts.show) {
        webview.style.visibility = "hidden";
        webview.style.display = "inline-flex";
        webview.style.position = "absolute";
        webview.style.width = "0";
        webview.style.height = "0";
    }

    // add to main view
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

    webview.addEventListener("did-finish-load", function(event){
        //remove the event so it gets called just once
        event.target.removeEventListener(event.type, arguments.callee);

        // execute this line of javascript in the webview which will fetch the whole html of the document,
        // and then it will send it to the specified callback
        webview.executeJavaScript("document.documentElement.outerHTML", false, function(html){
            removeWebview(webview);
            cb(html);
        });

    });

}

ipcRenderer.on("load", function(event, url, promiseID) {
    load(url, (html)=>{
        promises.get(promiseID).resolve(html);
        promises.remove(promiseID);
    });
});
