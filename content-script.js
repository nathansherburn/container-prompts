console.log("Content script is running!");

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
  shadow.innerHTML = `
    <style>
      #menu-bar {
        position: fixed;
        box-sizing: border-box;
        top: 16px; /* Added gap from the top */
        right: 16px; /* Added gap from the right */
        padding: 16px;
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background-color: white; /* Added white background */
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2); /* Added drop shadow */
        border-radius: 32px; /* Added border radius */
      }
      #menu-bar div {
        padding: 16px;
        background-color: white;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
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
        padding: 8px 16px;
        border: none;
        background-color: #0078d4;
        color: white;
        font-size: 16px;
        border-radius: 16px;
        cursor: pointer;
        width: 100%;
        height: 40px;
        transition: background-color 0.2s;
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
        text-decoration: none;
        color: black;
        border-radius: 16px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
      }
      #menu-bar a:hover {
        background-color: #f0f0f0;
        transition: background-color 0.2s;
      }
      #menu-bar .container-icon {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-right: 8px;
        padding: 8px;
      }
    </style>
    <div id="menu-bar">
      <ul id="container-list"></ul>
      <button id="close-menu-bar">Close</button>
    </div>
  `;
  return menuBar;
}

// Add the menu bar to the page
function addMenuBarToPage() {
  isDefaultContainer().then((isDefault) => {
    console.log("Is default container:", isDefault);
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
      console.log("Containers:", response);
      const containerList = shadow.getElementById("container-list");
      response.containers.forEach((identity) => {
        const listItem = document.createElement("li");
        const icon = document.createElement("img");
        const link = document.createElement("a");
        const containerName = document.createElement("span");
        containerName.textContent = identity.name;
        icon.src = identity.iconUrl;
        icon.classList.add("container-icon");
        icon.style.backgroundColor = identity.colorCode;
        link.href = "#";
        link.addEventListener("click", () => {
          console.log(`Container selected: ${identity.name}`);
          browser.runtime.sendMessage({
            action: "changeContainer",
            containerId: identity.cookieStoreId,
          }).then(() => {
            browser.tabs.getCurrent().then((tab) => {
              browser.tabs.remove(tab.id);
            });
          });
        });
        link.appendChild(icon);
        link.appendChild(containerName);
        listItem.appendChild(link);
        containerList.appendChild(listItem);
      });
    }).catch((error) => console.error("Error fetching containers:", error));
  }).catch((error) => console.error("Error checking default container:", error));
}

// Run the functions to add the menu bar and styles
addMenuBarToPage();
