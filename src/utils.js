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

function showModal(modal) {
  $(modal).modal('show');
}

export default {
  getOpenModalSelector,
  hideModal,
  showModal,
};
