console.log('tab.js');

window.document.title = "Sleepy Tab";
var targetUrl = "";

chrome.runtime.onMessage.addListener(function(response, sender) {

    if (response.message === "sleep") {
        targetUrl = response.url;
    } else if (response.message === "active") {
        window.location.href = targetUrl;
    }

});
