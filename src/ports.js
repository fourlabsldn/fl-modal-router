/* globals Elm, $ */
/* eslint-disable new-cap, no-underscore-dangle */

/**
 * If it's not a Maybe, returns whatever value that is, if it is
 * a Maybe, returns `value` for `Just value` and `null` for `Nothing`
 * @method fromMaybe
 * @param  {Object<Any> | Any } val
 * @return {Any}
 */
const fromMaybe = val => {
  const isMaybe = val && val.ctor;

  if (!isMaybe) {
    return val;
  }

  return val._0 ? val._0 : null;
};

/**
 * Creates an Elm acceptable Modal object
 * @method Modal
 * @param  {String} selector
 * @param  {String | Maybe String} targetUrl
 */
const Modal = function ({ selector, targetUrl } = {}) {
  if (!selector) {
    // It was not set by Elm
    return null;
  }

  const url = fromMaybe(targetUrl);
  return { selector, targetUrl: url };
};

/**
 * Creates an Elm acceptable HistoryState object
 * @method HistoryState
 * @param  {String} url
 * @param  {Array<Modal>}
 */
const HistoryState = function ({ url, openModals = [] } = {}) {
  if (!url) {
    // It was not set by Elm
    return null;
  }

  const modals = openModals.map(Modal);
  modals.forEach(m => {
    if (!m) {
      throw new Error(
        'A null modal was found in a history state. '
        + `Something is wrong. Here are all the modals ${JSON.stringify(modals)}`
      );
    }
  });
  return { url, openModals: modals };
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
  const histState = HistoryState(e.state);
  onPopState.send(histState);
});

function getModalInfo(e) {
  const targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href')
      ? e.relatedTarget.getAttribute('href')
      : null;

  const selector = `#${e.target.id}`;
  const modalInfo = Modal({ selector, targetUrl });
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
