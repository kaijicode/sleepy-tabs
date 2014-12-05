console.log('background.js');

var targetUrl = "";
var targetTitle = "";

// all sleepy tabs id's and their active window id
// are stored here as windowId: [tabId1, tabId2...]
var openSleepyTabsIds = {};

// when new tab is created, we execute tab.js script which listens for notification (activation)
function handleNewTab(tab) {
    chrome.tabs.executeScript(tab.id, {file: "tab.js"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('sleepy-tab: ', chrome.runtime.lastError.message);
            }

            // we have to find current window the tab is running
            chrome.windows.getCurrent(function(currentWindow) {

                // TODO: it turns out, there might be multiple active "tabs", chrome dev tools actually a tab too!
                // get current active tab id in current window
                var currentTabId = chrome.tabs.query({active: true, windowId: currentWindow.id}, function(active) {
                    
                    // send message to current active tab
                    // by that, we saying we need title for new created tab
                    chrome.tabs.sendMessage(active[0].id, {message: "get:title"}, function(response) {
                        targetTitle = response.title;

                        // after we got the title from the active tab,
                        // send message to new created tab with url and title that it should use.
                        chrome.tabs.sendMessage(tab.id, {message: "sleep",
                            tabId: tab.id, 
                            url: targetUrl, 
                            title: targetTitle
                        });

                        // keep track of our sleepy tabs.
                        trackSleepyTab(tab.id, currentWindow.id);

                    });

                });

            });
    });
}

// TODO: find better way to open blank page.
// because of the restrictions chrome://, about:blank can't be used
// since content scripts doesn't executed there.
// create new empty tab
function createSleepyTab(info, tab) {
    // save url of the new tab
    targetUrl = info.linkUrl;
    chrome.tabs.create({url: "file:///", active: false}, handleNewTab);
}

// add new tab to our tracked tabs object
function trackSleepyTab(tabId, windowId) {
    if (openSleepyTabsIds[windowId]) {
        openSleepyTabsIds[windowId].push(tabId);
    } else {
        openSleepyTabsIds[windowId] = [tabId];
    }
}

// function removes sleepy tab id from list of opened tabs
function removeSleepyTab(tabId, removeInfo) {
    windowId = removeInfo.windowId;
    if (!openSleepyTabsIds[windowId]) {
        return;
    }

    var idx = openSleepyTabsIds[windowId].indexOf(tabId);
    if (idx >= 0) {
        console.log('windowID: ', windowId, 'tabID: ', tabId,idx, 'tabs: ', openSleepyTabsIds);
        openSleepyTabsIds[windowId].splice(idx, 1);
    }
}

// is such sleepy tab exists?
function isSleepyTabExist(tabId, windowId) {
    if (openSleepyTabsIds[windowId] && openSleepyTabsIds[windowId].indexOf(tabId) >= 0) {
        return true;
    }

    return false;
}

// when tab get's active, we send notification to that tab.
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // we send notifications _only_ for sleepy tab, not regular!
    if (isSleepyTabExist(activeInfo.tabId, activeInfo.windowId)) {
         chrome.tabs.sendMessage(activeInfo.tabId, {message: "active"});
    }

    if (chrome.runtime.lastError) {
        console.error('sleepy-tab: ', chrome.runtime.lastError.message);
    }

});

// tab close event
chrome.tabs.onRemoved.addListener(removeSleepyTab);

// add sleepy tab to context menu
var contextMenuItem = chrome.contextMenus.create({"title": "Open sleepy tab", "contexts": ["link"],
    "onclick": createSleepyTab});


