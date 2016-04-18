import utils from './utils';
import stateHandler from './stateHandler';
import assert from './assert.js';

export default function modalRouter($) {
  let isInitialised = false;

  assert($, 'ModalRouter: No JQuery'); }

  function onModalShow(e) {
    // Did it show as a result of a state change?
    const currState = window.history.state;
    if (currState && currState.isModalState) {
      // If it did then there is nothing else to be done.
      return;
    }

    // Otherwise, then create a new history record with data about this modal.
    const modalButton = e.relatedTarget;
    if (!modalButton) {
      return;
    }

    const targetUrl = utils.getTargetUrl(modalButton);
    if (!targetUrl) {
      console.log('No target url');
      return;
    }

    const targetModal = modalButton.dataset.target;
    if (!targetModal) {
      console.error('ModalRouter: No target modal specified.');
      return;
    }

    const title = '';
    const state = {
      targetUrl,
      targetModal,
      isModalState: true,
      prevState: window.history.state,
      prevUrl: window.location.pathname,
    };

    stateHandler.push(state, title, targetUrl);
  }

  function onModalHide() {
    // Did it hide as a result of a state change?
    const currState = window.history.state;
    if (!currState || !currState.isModalState) {
      // If it did then there is nothing else to be done.
      return;
    }

    // If it didn't then let's add to the history
    const lastModalState = stateHandler.getLastModalState();
    if (!lastModalState) { return; }
    const state = lastModalState.prevState;
    const url = lastModalState.prevUrl;
    const title = '';
    window.history.pushState(state, title, url);
  }

  function onHistoryChange() {
    console.log('History change called');

    // Is the new history state one of the past ones we created?
    const newState = window.history.state;
    console.log(newState);
    const isPastState = stateHandler.isPastState(newState);

    let modalShowing;
    if (isPastState) {
      // If it is, then let's make sure the modal is open.
      modalShowing = utils.modalFromStateIsShowing(newState);
      if (!modalShowing) {
        utils.showModalFromState(newState);
        return;
      }
    }

    // If it isn't let's see if it has a different URL from our last recorded state
    const lastModalState = stateHandler.getLastModalState();
    if (lastModalState &&
        window.location.pathname === lastModalState.targetUrl) {
      // If it is the same URL then we don't need to change anything.
      return;
    }

    // if the url is different let's check whether its modal is showing up
    modalShowing = utils.modalFromStateIsShowing(lastModalState);
    // if it is, then hide it.
    if (modalShowing) {
      utils.hideModalFromState(lastModalState);
    }
  }

  function init() {
    // Set initialisation state
    if (isInitialised) {
      return;
    }
    isInitialised = true;

    // Check if body was loaded, if it wasn't then come back when it has;
    const body = document.body;
    if (!body) {
      isInitialised = false;
      window.addEventListener('load', init);
      return;
    }

    const $body = $(body);
    window.addEventListener('popstate', onHistoryChange);
    $body.on('shown.bs.modal', onModalShow);
    $body.on('hidden.bs.modal', onModalHide);
  }

  return {
    init,
  };
}
