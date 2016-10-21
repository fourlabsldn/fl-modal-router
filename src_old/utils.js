/* globals $*/
import assert from './assert';

assert($, 'jQuery not initialised.');

function modalIsOpen(modal) {
  return window.getComputedStyle(modal).display !== 'none';
}

// TODO: this should return a better selector than just an ID.
function getOpenModalSelector() {
  const pageModalsLiveCol = document.querySelectorAll('.modal');
  const pageModals = Array.from(pageModalsLiveCol);
  for (const modal of pageModals) {
    if (modalIsOpen(modal)) {
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
    // NOTE: the 'request' API does not send cookies with the request,
    // that's why we are using this one instead.
    new Promise((resolve, reject) => {
      $.ajax({
        type: 'get',
        url: targetUrl,
        cache: true,
        success: resolve,
        failure: reject,
      });
    })
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
