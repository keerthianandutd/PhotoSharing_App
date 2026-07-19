import React from "react";
import "./styles.css"; // Add styling here

function DeleteModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) {
    return null; // Do not render the modal if it's not open
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>{message || "Are you sure you want to delete this?"}</p>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
