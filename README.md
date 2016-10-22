# Scrapman

>*Ski-bi dibby dib yo da dub dub*<br>
*Yo da dub dub*<br>
*Ski-bi dibby dib yo da dub dub*<br>
*Yo da dub dub*<br><br>
***I'm the Scrapman!***

###THE FASTEST SCRAPPER EVER\*... AND IT SUPPORTS PARALLEL REQUESTS <small>(\*arguably)</small>

Scrapman is a blazingly fast **real (with Javascript executed)** HTML scrapper, built from the ground up to support parallel fetches, with this you can get the HTML code for 50+ URLs in seconds (~30 seconds).

On NodeJS you can easily use `request` to fetch the HTML from a page, but what if the page you are trying to load is *NOT* a static HTML page, but it has dynamic content added with Javascript? What do you do then? Well, you use ***The Scrapman***.

It uses [Electron](http://electron.atom.io) to dynamically load web pages into several `<webview>` within a single Chromium instance. This is why it fetches the HTML exactly as you would see it if you inspect the page with DevTools.

This is **NOT** an browser automation tool (yet), it's a node module that gives you the processed HTML from an URL, it focuses on multiple parallel operations and speed.

##USAGE

1.- Install it

`npm install scrapman -S`

2.- Require it

`var scrapman = require("scrapman");`

3.- Use it (as many times as you need)

Single URL request

```javascript
scrapman.load("http://google.com", function(results){
	//results contains the HTML obtained from the url
	console.log(results);
});
```
Parallel URL requests

```javascript
//yes, you can use it within a loop.
for(var i=1; i<=50; i++){
    scrapman.load("https://www.website.com/page/" + i, function(results){
        console.log(results);
    });
}
```

##API

>One method to rule them all

###scrapman.load(url, callback)

####url
Type: `String`<br>

The URL from which the HTML code is going to be obtained.

####callback(results)
Type: `Function`<br>

The callback function to be executed when the loading is done. The loaded HTML will be in the `results` parameter.

## Questions
Feel free to open Issues to ask questions about using this package, PRs are very welcomed and encouraged.

**SE HABLA ESPAÑOL**

## License

MIT © Daniel Nieto
