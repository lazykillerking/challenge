const IMAGE_ITEMS = {
  standard: {
    name: "Signal Fragment",
    price: 100,
    ownedEl: document.getElementById("standard-owned"),
  },
  premium: {
    name: "Premium Vault Image",
    price: 1000,
    ownedEl: document.getElementById("premium-owned"),
  },
};

const PRIZE_PARTS = [
  "aHR0cHM6Ly9nb2ZpbGUuaW8vZC84NTdmMjE3Yi05N2E3LTRmZWYtOTYwNy0wNmFiOTFlNTYwOWE=",
];
const WINDOW_MS = 1;
const pending = {};

const playerNameEl = document.getElementById("player-name");
const creditsEl = document.getElementById("credits");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");
const premiumTile = document.getElementById("premium-tile");
const prizeSlot = document.getElementById("prize-slot");

let player = loadPlayer();

if (!player) {
  window.location.href = "index.html";
}

function loadPlayer() {
  const saved = localStorage.getItem("credit-vault-player");

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);
    parsed.inventory = parsed.inventory || {};
    parsed.inventory.standard = parsed.inventory.standard || 0;
    parsed.inventory.premium = parsed.inventory.premium || 0;
    return parsed;
  } catch {
    localStorage.removeItem("credit-vault-player");
    return null;
  }
}

function savePlayer() {
  localStorage.setItem("credit-vault-player", JSON.stringify(player));
}

function setStatus(message, state = "info") {
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

function render() {
  if (!player) {
    return;
  }

  playerNameEl.textContent = player.username;
  creditsEl.textContent = String(player.credits);

  Object.entries(IMAGE_ITEMS).forEach(([itemId, item]) => {
    item.ownedEl.textContent = String(player.inventory[itemId] || 0);
  });

  const hasPremium = player.inventory.premium > 0;
  premiumTile.classList.toggle("locked", !hasPremium);
  premiumTile.classList.toggle("unlocked", hasPremium);

  if (hasPremium) {
    revealPrize();
  } else {
    prizeSlot.replaceChildren();
  }
}

function revealPrize() {
  if (prizeSlot.firstElementChild) {
    return;
  }

  const prizeLink = document.createElement("a");
  prizeLink.href = atob(PRIZE_PARTS.join(""));
  prizeLink.target = "_blank";
  prizeLink.rel = "noopener noreferrer";
  prizeLink.textContent = "Open premium image";
  prizeSlot.replaceChildren(prizeLink);
}

function buyImage(itemId) {
  const item = IMAGE_ITEMS[itemId];

  if (player.credits < item.price) {
    setStatus(`Not enough credits to buy ${item.name}.`, "error");
    return;
  }

  player.credits -= item.price;
  player.inventory[itemId] += 1;
  pending[itemId] = true;
  setTimeout(() => {
    pending[itemId] = false;
  }, WINDOW_MS);
  savePlayer();
  render();
  setStatus(`${item.name} bought for ${item.price} credits.`, "success");
}

function sellImage(itemId) {
  const item = IMAGE_ITEMS[itemId];

  if (player.inventory[itemId] < 1) {
    setStatus(`You need to own ${item.name} before selling it.`, "error");
    return;
  }

  const isPending = Boolean(pending[itemId]);

  player.credits += item.price;

  if (!isPending) {
    player.inventory[itemId] -= 1;
  }

  savePlayer();
  render();

  setStatus(`${item.name} sold for ${item.price} credits.`, "success");
}

document.getElementById("buy-standard").addEventListener("click", () => buyImage("standard"));
document.getElementById("sell-standard").addEventListener("click", () => sellImage("standard"));
document.getElementById("buy-premium").addEventListener("click", () => buyImage("premium"));
document.getElementById("sell-premium").addEventListener("click", () => sellImage("premium"));

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("credit-vault-player");
  window.location.href = "index.html";
});

window.marketApi = {
  buyImage,
  sellImage,
  getPlayer: () => player,
};

render();
