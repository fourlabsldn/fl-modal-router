/* globals Elm, $ */
/* eslint-disable new-cap */
const app = Elm.ModalRouter.fullscreen();

// We send stuff to Elm with suggestions
const {
  onPopState,
  onModalOpen,
  onModalClose,
} = app.ports;

const Modal = function (selector, targetUrl) {
  return selector ? { selector, targetUrl } : null;
};

const HistoryState = function ({ url, selector, targetUrl } = {}) {
  return url
    ? { url, modal: Modal(selector, targetUrl) }
    : null;
};

window.addEventListener('popstate', (e) => {
  const newState = e.state;
  const histState = newState
    ? new HistoryState(newState, 'moda-router-state', newState.url)
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
  .on('hide.bs.modal', (e) => onModalClose.send(getModalInfo(e)));
