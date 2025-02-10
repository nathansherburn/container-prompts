// Check if the current container is the default container
function isDefaultContainer() {
  return browser.runtime.sendMessage({ action: "getCurrentContainer" }).then((response) => {
    return response.isDefault;
  });
}

// Create the menu bar for switching containers
function createMenuBar() {
  const menuBar = document.createElement("div");
  menuBar.id = "multi-account-container-switcher-menu-bar";
  const shadow = menuBar.attachShadow({ mode: "open" });
  shadow.innerHTML = /*html*/`
    <style>
      #menu-bar {
        position: fixed;
        box-sizing: border-box;
        top: 50%;
        transform: translateY(-50%);
        right: 16px;
        padding: 16px;
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background-color: white;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
        border-radius: 32px;
      }
      #menu-bar div {
        background-color: white;
        border-radius: 32px;
      }
      #menu-bar ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
      #menu-bar button {
        margin-top: 16px;
        padding: 8px;
        border: none;
        background-color: #0078d4;
        color: white;
        border-radius: 32px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.2s;
        line-height: 0;
      }
      #menu-bar button:hover {
        background-color: #005a9e;
      }
      #menu-bar button:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.4);
      }
      #menu-bar button:active {
        background-color: #004578;
      }
      #menu-bar a {
      }
      #menu-bar a:hover {
        background-color: #f0f0f0;
        transition: background-color 0.2s;
      }
      #menu-bar .container-icon {
        width: 16px;
        height: 16px;
        padding: 8px;
      }
      .icon-container:hover {
        opacity: 0.8;
      }
    </style>
    <div id="menu-bar">
      <ul id="container-list"></ul>
      <button id="close-menu-bar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;
  return menuBar;
}

// Add the menu bar to the page
function addMenuBarToPage() {
  isDefaultContainer().then((isDefault) => {
    if (!isDefault) {
      return;
    }

    const menuBar = createMenuBar();
    document.body.insertBefore(menuBar, document.body.firstChild);

    const shadow = menuBar.shadowRoot;
    const closeButton = shadow.getElementById("close-menu-bar");
    closeButton.addEventListener("click", () => {
      menuBar.style.display = "none";
    });

    // Send a message to the background script to get container identities
    browser.runtime.sendMessage({ action: "getContainers" }).then((response) => {
      const containerList = shadow.getElementById("container-list");
      response.containers.forEach((identity) => {
        const listItem = document.createElement("li");
        const icon = document.createElement("img");
        const iconContainer = document.createElement("div");
        const iconOverlay = document.createElement("div");
        const link = document.createElement("a");
        iconOverlay.style.backgroundColor = identity.colorCode;
        iconOverlay.style.opacity = "0.8";
        icon.src = identity.iconUrl;
        icon.classList.add("container-icon");
        iconContainer.style.position = "relative";
        icon.style.left = 0;
        icon.style.top = 0;
        iconOverlay.style.height = "32px";
        iconOverlay.style.width = "32px";
        iconContainer.style.margin = "4px 0px";
        iconOverlay.style.position = "absolute";
        iconOverlay.style.left = 0;
        iconOverlay.style.top = 0;
        iconContainer.classList.add("icon-container");
        iconContainer.appendChild(icon);
        iconContainer.appendChild(iconOverlay);
        link.href = "#";
        link.addEventListener("click", () => {
          browser.runtime.sendMessage({
            action: "changeContainer",
            containerId: identity.cookieStoreId,
          }).then(() => {
            browser.tabs.getCurrent().then((tab) => {
              browser.tabs.remove(tab.id);
            });
          });
        });
        link.appendChild(iconContainer);
        listItem.appendChild(link);
        containerList.appendChild(listItem);
      });
    }).catch((error) => console.error("Error fetching containers:", error));
  }).catch((error) => console.error("Error checking default container:", error));
}

// Run the functions to add the menu bar and styles
addMenuBarToPage();
