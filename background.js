console.log('background.js');

var targetUrl = "";
var sleepyTabs = [];

function handleNewTab(tab) {
    chrome.tabs.executeScript(tab.id, {file: "tab.js"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('sleepy-tab: ', chrome.runtime.lastError.message);
            }

            chrome.tabs.sendMessage(tab.id, {message: "sleep" ,tabId: tab.id, url: targetUrl});
            sleepyTabs.push(tab.id);
    });
};

function createSleepyTab(info, tab) {
    targetUrl = info.linkUrl;
    chrome.tabs.create({url: "file:///", active: false}, handleNewTab);
};


chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (sleepyTabs.indexOf(activeInfo.tabId) >= 0) {
        console.log('sending active');
        chrome.tabs.sendMessage(activeInfo.tabId, {message: "active"});
    };

    if (chrome.runtime.lastError) {
        console.error('sleepy-tab: ', chrome.runtime.lastError.message);
    }

});

var contextMenuItem = chrome.contextMenus.create({"title": "Open sleepy tab", "contexts": ["link"],
    "onclick": createSleepyTab});


