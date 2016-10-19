/* globals Elm */
/* eslint-disable new-cap */

const ModalInfo = function (modalSelector, targetUrl) {
  return modalSelector ? { modalSelector, targetUrl } : null;
};

const HistoryState = function ({ url, modalSelector, targetUrl } = {}) {
  return url
    ? { url, modalInfo: ModalInfo(modalSelector, targetUrl) }
    : null;
};

var _user$project$Native_History = {
  pushState: (...args) => window.history.pushState(...args),
  replaceState: (...args) => window.history.replaceState(...args),
  getState: () => HistoryState(window.history.state),
};
