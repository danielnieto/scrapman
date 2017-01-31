/*jshint esversion: 6*/

const {ipcRenderer, remote} = require("electron");

//get the 'section' DOM element that will hold all dynamically created <webview> tags
let webviewsContainer = document.querySelector("#webviewsContainer");
let promises = remote.require("./promises.js");

//add new <webview> tag in the main window
let createWebview = (opts = {}) => {
    let webview = document.createElement("webview");

    // hide the webview if opts.show === false
    if(!opts.show) webview.classList.add("hide");

    // add to main view
    webviewsContainer.appendChild(webview);

    return webview;
};

let removeWebview = (webview) => {
    webviewsContainer.removeChild(webview);
};

let load = (args, cb) => {

    //create and add new instance of webview
    let webview = createWebview({show: false});

    //make webview navigate to desired URL
    webview.setAttribute("src", args.url);

    webview.addEventListener("did-finish-load", function(event){
        //remove the event so it gets called just once
        event.target.removeEventListener(event.type, arguments.callee);

        // execute this line of javascript, which will fetch the whole html of the document,
        // and then it will send it to the specified callback
        const fetchHTML = function(){
            return webview.executeJavaScript("document.documentElement.outerHTML", false, function(html){
                removeWebview(webview);
                cb(html);
            });
        };

        // if "wait" configuration option has been set other than 0, then wait for this many milliseconds
        // before fetching the html of the page
        if(args.wait){
            setTimeout(fetchHTML, args.wait);
        }else{
            fetchHTML();
        }

    });

};

ipcRenderer.on("load", function(event, args, promiseID) {
    load(args, (html)=>{
        promises.get(promiseID).resolve(html);
        promises.remove(promiseID);
    });
});
