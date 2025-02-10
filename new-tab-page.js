let containerButtons = null;
let containerButtonTemplate = null;
let currentContainer = null;

window.addEventListener("load", init);

// Initialize the new tab page
async function init() {
  containerButtons = document.querySelector("#container-buttons");
  containerButtonTemplate = document.querySelector(
    "#container-button-template",
  );
  currentContainer = document.querySelector("#current-container-color");

  // Initialize the clock
  updateClock();
  setInterval(updateClock, 1000);

  // Get the current container ID
  const currentContainerId = await getCurrentContainerId();
  currentContainer.style.backgroundColor = "rgb(162, 162, 162)";

  // Query all container identities
  browser.contextualIdentities.query({}).then((identities) => {
    if (!identities.length) {
      containerButtons.innerText =
        "It looks like you don't have any account containers.";
      return;
    }

    // Create buttons for each container identity
    for (let identity of identities) {
      let node = createButton(identity);
      containerButtons.appendChild(node);
      if (identity.cookieStoreId === currentContainerId) {
        currentContainer.style.backgroundColor = identity.colorCode;
        currentContainer.style.fill = identity.colorCode;
        updateCurrentContainerBadge(identity.name, identity.colorCode);
      }
    }

    // Add a default container button
    containerButtons.appendChild(
      createButton({
        cookieStoreId: "",
        iconUrl: "resource://usercontext-content/circle.svg",
        colorCode: "#a2a2a2",
        name: "Default Container",
      }),
    );
  });
}

// Update the clock with the current time
function updateClock() {
  const clock = document.querySelector("#clock");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}`;
}

// Update the current container badge
function updateCurrentContainerBadge(containerName, containerColor) {
  const badge = document.querySelector("#current-container-badge");
  badge.textContent = containerName;
  badge.style.setProperty("--container-color", hexToRGBA(containerColor, 1));
  badge.style.setProperty("--container-color-dark", hexToRGBA(containerColor, 1));
  badge.style.setProperty("--container-color-light",  hexToRGBA(containerColor, 0.1));
}

// Shade a color in HSL format
function hexToRGBA(hex, alpha = 1) {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  
  // Validate hex format
  if (!/^([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      throw new Error('Invalid HEX color format');
  }
  
  // Validate alpha value
  if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
      throw new Error('Alpha value must be a number between 0 and 1');
  }

  // Convert shorthand hex (e.g., #F00) to full form (e.g., #FF0000)
  if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
  }
  
  // Convert hex to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Change the container of the current tab
function changeContainer(node) {
  browser.tabs.getCurrent().then(
    (tabInfo) => {
      browser.tabs.create({
        cookieStoreId: node.getAttribute("data-container"),
        index: tabInfo.index + 1,
      }).then(() => {
        browser.tabs.remove(tabInfo.id);
      });
    },
    () => console.error("Cannot change contextual identity for current tab"),
  );
}

// Create a button for a container identity
function createButton(identity) {
  let node = containerButtonTemplate.content
    .querySelector(".container-button")
    .cloneNode(true);
  node.querySelector(".name").innerText = identity.name;
  node.querySelector(".icon").setAttribute("src", identity.iconUrl);
  node.querySelector(".icon-overlay").style.backgroundColor = hexToRGBA(identity.colorCode, 0.8);
  node.setAttribute("data-container", identity.cookieStoreId);
  node.addEventListener("click", function () {
    changeContainer(node);
  });
  return node;
}

// Get the current container ID of the tab
async function getCurrentContainerId() {
  let tabInfo = await browser.tabs.getCurrent();
  return tabInfo.cookieStoreId;
}
