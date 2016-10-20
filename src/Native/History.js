/* globals Elm */
/* eslint-disable new-cap */

const Modal = function (selector, targetUrl) {
  return selector ? { selector, targetUrl } : null;
};

const HistoryState = function ({ url, selector, targetUrl } = {}) {
  return url
    ? { url, modal: Modal(selector, targetUrl) }
    : null;
};

const _user$project$Native_History = {
  pushState: (state) => window.history.pushState(state, 'modal-router-state', state.url),
  replaceState: (state) => window.history.replaceState(state, 'modal-router-state', state.url),
  getState: () => {
    const windowState = window.history.state;
    const histState = windowState
      ? new HistoryState(windowState.url, windowState.selector, windowState.targetUrl)
      : null;

    return histState;
  },
};
