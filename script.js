const STARTING_CREDITS = 100;
const PREMIUM_COST = 1000;

const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const loginView = document.getElementById("login-view");
const vaultView = document.getElementById("vault-view");
const loginForm = document.getElementById("login-form");
const playerNameEl = document.getElementById("player-name");
const creditsEl = document.getElementById("credits");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");
const premiumTile = document.getElementById("premium-tile");
const premiumCopy = document.getElementById("premium-copy");

const hasSupabaseConfig =
  SUPABASE_URL !== "https://YOUR_PROJECT_REF.supabase.co" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

const supabaseClient =
  hasSupabaseConfig && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

let player = loadPlayer();

function loadPlayer() {
  const saved = localStorage.getItem("credit-vault-player");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
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
  const isLoggedIn = Boolean(player);

  loginView.hidden = isLoggedIn;
  vaultView.hidden = !isLoggedIn;

  if (!isLoggedIn) {
    return;
  }

  playerNameEl.textContent = player.username;
  creditsEl.textContent = String(player.credits);

  const canOpenPremium = player.credits >= PREMIUM_COST;
  premiumTile.classList.toggle("locked", !canOpenPremium);
  premiumTile.classList.toggle("unlocked", canOpenPremium);
  if (canOpenPremium) {
    premiumCopy.textContent = "Enough credits collected. Visit the market to buy the premium image.";
  } else {
    premiumCopy.textContent = `${PREMIUM_COST - player.credits} more credits required.`;
  }
}

function addCredits(amount) {
  if (!player) {
    return;
  }

  player.credits += amount;
  savePlayer();
  render();
}

function checkSupabaseConnection() {
  if (!window.supabase) {
    setStatus("Supabase library failed to load. The offline CTF still works.", "warning");
    return;
  }

  if (!supabaseClient) {
    setStatus("Supabase config is empty. Running as a local frontend CTF.", "warning");
    return;
  }

  setStatus("Supabase client loaded. Add database calls when ready.", "success");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get("username")).trim();

  player = {
    username,
    credits: STARTING_CREDITS,
  };

  savePlayer();
  loginForm.reset();
  render();
  checkSupabaseConnection();
  window.location.href = "market.html";
});

logoutBtn.addEventListener("click", () => {
  player = null;
  localStorage.removeItem("credit-vault-player");
  setStatus("");
  render();
});

window.challengeApi = {
  addCredits,
  getCredits: () => (player ? player.credits : 0),
};

render();
if (player) {
  checkSupabaseConnection();
}
