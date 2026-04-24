const STARTING_CREDITS = 100;
const BONUS_CREDITS = 100;
const PREMIUM_COST = 1000;
const FLAG = "flag{replace_this_with_your_real_flag}";

const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const loginView = document.getElementById("login-view");
const vaultView = document.getElementById("vault-view");
const loginForm = document.getElementById("login-form");
const playerNameEl = document.getElementById("player-name");
const creditsEl = document.getElementById("credits");
const statusEl = document.getElementById("status");
const bonusBtn = document.getElementById("bonus-btn");
const logoutBtn = document.getElementById("logout-btn");
const premiumBtn = document.getElementById("premium-btn");
const premiumTile = document.getElementById("premium-tile");
const premiumCopy = document.getElementById("premium-copy");
const flagText = document.getElementById("flag-text");

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
  premiumBtn.disabled = !canOpenPremium;

  if (canOpenPremium) {
    premiumCopy.textContent = "Premium image unlocked.";
  } else {
    premiumCopy.textContent = `${PREMIUM_COST - player.credits} more credits required.`;
    flagText.textContent = "";
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

// Intentionally vulnerable for the CTF: this client-side API has no real
// server validation or rate limit, so players can automate credit claims.
function claimDailyBonus() {
  addCredits(BONUS_CREDITS);
  setStatus(`Bonus accepted. Wallet credited with ${BONUS_CREDITS}.`, "success");
}

function openPremiumImage() {
  if (!player || player.credits < PREMIUM_COST) {
    setStatus("Premium vault rejected the wallet balance.", "error");
    return;
  }

  flagText.textContent = FLAG;
  setStatus("Premium vault opened.", "success");
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
});

bonusBtn.addEventListener("click", claimDailyBonus);
logoutBtn.addEventListener("click", () => {
  player = null;
  localStorage.removeItem("credit-vault-player");
  setStatus("");
  render();
});
premiumBtn.addEventListener("click", openPremiumImage);

window.challengeApi = {
  claimDailyBonus,
  addCredits,
  getCredits: () => (player ? player.credits : 0),
};

render();
if (player) {
  checkSupabaseConnection();
}
