/* globals Elm, $ */
/* eslint-disable new-cap */
const app = Elm.ModalRouter.fullscreen();

// We receive from elm with subscribe and send to it with suggestions
const {
  // receiving from elm
  openModal,
  closeModal,
  pushHistoryState,
  replaceHistoryState,
  // getModal,

  // sending to elm
  onPopState,
  onModalOpen,
  onModalClose,
} = app.ports;

const ModalInfo = function (modalSelector, targetUrl) {
  return modalSelector ? { modalSelector, targetUrl } : null;
};

openModal.subscribe((modalSelector) => {
  const modalElement = document.querySelector(modalSelector);
  $(modalElement).modal('show');
});

closeModal.subscribe((modalSelector) => {
  const modalElement = document.querySelector(modalSelector);
  $(modalElement).modal('hide');
});

pushHistoryState.subscribe((state) => {
  history.pushState(state, 'randomName', state.url);
});

replaceHistoryState.subscribe((state) => {
  history.replaceState(state, 'randomName', state.url);
});

window.addEventListener('popstate', (e) => {
  onPopState.send(e.state);
});

$(document.body)
  .on('show.bs.modal', (e) => {
    const targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href')
        ? e.relatedTarget.getAttribute('href')
        : null;

    const modalSelector = `#${e.target.id}`;
    const modalInfo = ModalInfo(modalSelector, targetUrl);
    onModalOpen.send(modalInfo);
  })
  .on('hide.bs.modal', () => onModalClose.send('modal-was-closed'));
