/* globals Elm, $ */
/* eslint-disable new-cap */
const app = Elm.ModalRouter.fullscreen();

// We send stuff to Elm with suggestions
const {
  onPopState,
  onModalOpen,
  onModalClose,
} = app.ports;

const ModalInfo = function (modalSelector, targetUrl) {
  return modalSelector ? { modalSelector, targetUrl } : null;
};


window.addEventListener('popstate', (e) => {
  onPopState.send(e.state);
});

function getModalInfo(e) {
  const targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href')
      ? e.relatedTarget.getAttribute('href')
      : null;

  const modalSelector = `#${e.target.id}`;
  const modalInfo = ModalInfo(modalSelector, targetUrl);
  return modalInfo;
}
$(document.body)
  .on('show.bs.modal', (e) => onModalOpen.send(getModalInfo(e)))
  .on('hide.bs.modal', (e) => onModalClose.send(getModalInfo(e)));
