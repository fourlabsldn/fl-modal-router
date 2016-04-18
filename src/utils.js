/* globals $*/
import assert from './assert';

assert($, 'jQuery not initialised.');

function getOpenModalSelector() {
  const pageModalsLiveCol = document.querySelectorAll('.modal');
  const pageModals = Array.from(pageModalsLiveCol);
  for (const modal of pageModals) {
    // Check whether the modal is open.
    if (modal.classList.contains('in')) {
      // If it is open, then return its id.
      return `#${modal.id}`;
    }
  }
  return null;
}

function hideModal(modal) {
  $(modal).modal('hide');
}

function showModal(modal, targetUrl) {
  // Hide any backdrops that may remain.
  const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
  for (const backdrop of backdrops) {
    backdrop.remove();
  }

  if (targetUrl) {
    // TODO: use xmlhttpRequest
    fetch(targetUrl)
    .then((data) => { return data.text(); })
    .then((content) => {
      // By the time this finishes loading, the modal may already have
      // disappeared.
      const modalWasRemoved = !modal;
      const pageMovedOnToAnotherAddress = !window.history.state ||
            window.history.state.targetUrl !== targetUrl;

      if (modalWasRemoved || pageMovedOnToAnotherAddress) {
        return;
      }
      const modalBody = modal.querySelector('.modal-content');
      assert(modalBody, 'Modal body not found.');
      modalBody.innerHTML = content;
    });
  }

  // Show the modal
  const modalObj = $(modal).modal();
  modalObj.modal('show');
}

export default {
  getOpenModalSelector,
  hideModal,
  showModal,
};
