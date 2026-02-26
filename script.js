const startBtn = document.getElementById("start-btn");
const statusEl = document.getElementById("status");

if (startBtn && statusEl) {
  startBtn.addEventListener("click", () => {
    statusEl.textContent = "Challenge initialized. Happy hacking.";
  });
}
