console.log('content.js');

// element user clicks on when opening new sleepy tab
var targetElement = null;

// we have to record each right click event
document.addEventListener("mousedown", function(event) {
    if (event.button == 2) { 
        targetElement = event.target;
    }
}, true);

// add listener for title event, when title needed - we supply it.
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
    if (response.message == "get:title") {
        var title = findTitle();
        sendResponse({'title': title});
    }
});

// function "guesses" what title new tab should get
// by looking at the clicking element.
function findTitle() {
    var title = "";

    if (targetElement.innerText) {
        title = targetElement.innerText;
    } else if (targetElement.alt) {
        title = targetElement.alt;
    } else {
        title = "Sleepy Tab";
    }

    return title;
}