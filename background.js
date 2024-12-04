// Handle browser action click to open a new tab with the custom new tab page
var handleClick = function() {
  var createData = {
    url: "/new-tab-page.html"
  };
  browser.tabs.create(createData);
};

browser.browserAction.onClicked.addListener(handleClick);

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCurrentContainer") {
    browser.contextualIdentities.query({}).then((identities) => {
      const currentContainer = identities.find(identity => identity.cookieStoreId === sender.tab.cookieStoreId);
      sendResponse({ isDefault: !currentContainer });
    }).catch((error) => {
      console.error("Error getting current container:", error);
      sendResponse({ isDefault: true });
    });
    return true; // Keep the message channel open for sendResponse
  }

  if (message.action === "getContainers") {
    browser.contextualIdentities.query({}).then((identities) => {
      sendResponse({ containers: identities });
    }).catch((error) => {
      console.error("Error getting containers:", error);
      sendResponse({ containers: [] });
    });
    return true; // Keep the message channel open for sendResponse
  }

  if (message.action === "changeContainer") {
    const { containerId } = message;
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
      const tab = tabs[0];
      browser.tabs.create({
        url: tab.url,
        cookieStoreId: containerId
      }).then(() => {
        browser.tabs.remove(tab.id);
      });
    }).catch((error) => {
      console.error("Error changing container:", error);
    });
  }
});
