/* globals Elm, $ */
/* eslint-disable new-cap */

Elm.Native = Elm.Native || {};
Elm.Native.Modal = Elm.Native.Modal || {};

// definition
Elm.Native.Modal.make = function (localRuntime) {
  // attempt to short-circuit
  if (localRuntime.Native.Modal.values) {
    return Elm.Native.Modal.values;
  }

  return {
    open: (selector) => {
      document.querySelector(selector);
      $(selector).moda('show');
    },
    close: (selector) => {
      document.querySelector(selector);
      $(selector).moda('hide');
    },
    getOpen: () => {
      return ['myId'];
    },
  };
};
