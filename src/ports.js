/* globals Elm, $ */
/* eslint-disable new-cap */

const getMaybe = val => {
  return val && val._0
    ? val._0
    : null;
}

const Modal = function (selector, targetUrl) {
  return selector ? { selector, targetUrl } : null;
};

const HistoryState = function ({ url, selector, targetUrl } = {}) {
  return url
    ? { url, modal: Modal(selector, targetUrl) }
    : null;
};

// =============================================================================

const app = Elm.ModalRouter.fullscreen();

// We send stuff to Elm with suggestions
const {
  onPopState,
  onModalOpen,
  onModalClose,
} = app.ports;

window.addEventListener('popstate', (e) => {
  console.log('Popstate called');
  const newState = e.state;
  const modal = newState ? getMaybe(newState.modal) : {};

  const histState = newState
    ? HistoryState({
        url: newState.url,
        selector: modal.selector,
        targetUrl: getMaybe(modal.targetUrl)
      })
    : null;
  onPopState.send(histState);
});

function getModalInfo(e) {
  const targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href')
      ? e.relatedTarget.getAttribute('href')
      : null;

  const modalSelector = `#${e.target.id}`;
  const modalInfo = Modal(modalSelector, targetUrl);
  return modalInfo;
}

$(document.body)
  .on('show.bs.modal', (e) => onModalOpen.send(getModalInfo(e)))
  .on('hide.bs.modal', (e) => {
    const modal = getModalInfo(e);
    if (!modal) {
      throw new Error('Modal close event did not contain a modal. Something is wrong.');
    }
    onModalClose.send(modal.selector);
  });
