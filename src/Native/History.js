/* globals Elm */
/* eslint-disable new-cap */

Elm.Native = Elm.Native || {};
Elm.Native.History = Elm.Native.History || {};


const ModalInfo = function (modalSelector, targetUrl) {
  return modalSelector ? { modalSelector, targetUrl } : null;
};

const HistoryState = function ({ url, modalSelector, targetUrl } = {}) {
  return url
    ? { url, modalInfo: ModalInfo(modalSelector, targetUrl) }
    : null;
};

// definition
Elm.Native.History.make = function (localRuntime) {
  // attempt to short-circuit
  if (localRuntime.Native.History.values) {
    return Elm.Native.History.values;
  }

  return {
    pushState: (...args) => window.history.pushState(...args),
    replaceState: (...args) => window.history.replaceState(...args),
    getState: () => HistoryState(window.history.state),
  };
};
