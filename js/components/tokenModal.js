// This module manages everything about the token modal
import { fa } from "../i18n.js"; // Import i18n for button text

const overlay = document.querySelector(".modal-overlay");
const modal = document.getElementById("demoModal");
const openBtn = document.querySelector("[data-open-modal]");
const closeButtons = modal.querySelectorAll("[data-close-modal]");
const input = document.getElementById("inputWord");
const primaryBtn = document.getElementById("primaryBtn");
const errorMsg = document.getElementById("errorMsg");
const page = document.getElementById("page");
let lastFocused = null;

function getFocusable(container) {
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ),
  ].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function open() {
  lastFocused = document.activeElement;
  overlay.dataset.open = "true";
  overlay.removeAttribute("aria-hidden");
  document.body.classList.add("modal-open");
  page?.setAttribute("aria-hidden", "true");
  input.focus();
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("mousedown", onOverlayMouseDown);
}

export function close() {
  overlay.dataset.open = "false";
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  page?.removeAttribute("aria-hidden");
  document.removeEventListener("keydown", onKeyDown);
  overlay.removeEventListener("mousedown", onOverlayMouseDown);
  if (lastFocused && typeof lastFocused.focus === "function")
    lastFocused.focus();
  input.value = "";
  errorMsg.textContent = "";
  primaryBtn.disabled = true;
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    close();
    return;
  }
  if (e.key === "Tab") {
    const f = getFocusable(modal);
    if (!f.length) {
      e.preventDefault();
      modal.focus();
      return;
    }
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

let clickStartedInside = false;
function onOverlayMouseDown(e) {
  clickStartedInside = modal.contains(e.target);
  overlay.addEventListener("click", onOverlayClickOnce, { once: true });
}
function onOverlayClickOnce(e) {
  const clickedInside = modal.contains(e.target);
  if (!clickedInside && !clickStartedInside) close();
}

// The only public function. It sets up the modal and takes a callback to execute on save.
export function initialize(onSaveCallback) {
  openBtn.addEventListener("click", open);
  closeButtons.forEach((btn) => btn.addEventListener("click", close));
  overlay.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });
  input.addEventListener("input", () => {
    primaryBtn.disabled = input.value.trim() === "";
    errorMsg.textContent = "";
  });
  primaryBtn.addEventListener("click", () => {
    const token = input.value.trim();
    onSaveCallback(token);
  });
}

export function setError(message) {
  errorMsg.textContent = message;
}

// --- NEW FUNCTION TO CONTROL UI LOADING STATE ---
export function setLoading(isLoading) {
  if (isLoading) {
    setError(""); // Clear previous errors
    primaryBtn.disabled = true;
    primaryBtn.textContent = fa.saving;
    closeButtons.forEach((btn) => (btn.disabled = true));
    input.disabled = true;
  } else {
    primaryBtn.disabled = input.value.trim() === "";
    primaryBtn.textContent = fa.save;
    closeButtons.forEach((btn) => (btn.disabled = false));
    input.disabled = false;
  }
}
