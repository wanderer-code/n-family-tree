// js/components/confirmationModal.js
import { fa } from "../i18n.js";

/**
 * Creates and displays a confirmation modal.
 * @param {string} message - The question to display in the modal.
 * @param {function} onConfirm - The callback function to execute if the user confirms.
 */
export function show(message, onConfirm) {
  // Create the modal structure
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "confirmation-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="confirmation-modal">
      <div class="confirmation-modal-body">
        <p>${message}</p>
      </div>
      <div class="confirmation-modal-actions">
        <button class="btn cancel-btn">${fa.cancel}</button>
        <button class="btn confirm-btn">${fa.confirm}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // Get references to the new elements
  const confirmBtn = modalOverlay.querySelector(".confirm-btn");
  const cancelBtn = modalOverlay.querySelector(".cancel-btn");

  // Function to close and remove the modal from the DOM
  const closeModal = () => {
    document.body.removeChild(modalOverlay);
  };

  // Add event listeners
  confirmBtn.addEventListener("click", () => {
    onConfirm();
    closeModal();
  });

  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    // Close only if the dark overlay itself is clicked
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}
