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
  badge.style.setProperty("--container-color", containerColor); // Set the CSS variable for container color
  badge.style.setProperty("--container-color-dark", shadeColorHSL(containerColor, -10)); // Set the darker variant
  badge.style.setProperty("--container-color-light", shadeColorHSL(containerColor, 50)); // Set the lighter variant
}

// Function to shade a color using HSL
function shadeColorHSL(color, percent) {
  const num = parseInt(color.slice(1), 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  l = l + (percent / 100);
  l = Math.min(1, Math.max(0, l));

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
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
  node.querySelector(".icon-container").style.backgroundColor =
    identity.colorCode;
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
