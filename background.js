console.log('background.js');

var targetUrl = "";
var deferredTabs = [];

function handleNewTab(tab) {
    chrome.tabs.executeScript(tab.id, {file: "tab.js"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('sleepy-tab: ', chrome.runtime.lastError.message);
            }

            chrome.tabs.sendMessage(tab.id, {message: "sleep" ,tabId: tab.id, url: targetUrl});
            deferredTabs.push(tab.id);
    });
};

function createDeferredTab(info, tab) {
    targetUrl = info.linkUrl;
    chrome.tabs.create({url: "file:///", active: false}, handleNewTab);
};


chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (deferredTabs.indexOf(activeInfo.tabId) >= 0) {
        console.log('sending active');
        chrome.tabs.sendMessage(activeInfo.tabId, {message: "active"});
    };

    if (chrome.runtime.lastError) {
        console.error('deferred-tab: ', chrome.runtime.lastError.message);
    }

});

var contextMenuItem = chrome.contextMenus.create({"title": "Open sleepy tab", "contexts": ["link"],
    "onclick": createDeferredTab});


