console.log('tab.js');

var targetUrl = "";
var targetTitle = "";

chrome.runtime.onMessage.addListener(function(response, sender) {
    if (response.message === "sleep") {
        targetUrl = response.url;
        window.document.title = response.title;
    } else if (response.message === "active") {
        window.location.href = targetUrl;
    }

});
