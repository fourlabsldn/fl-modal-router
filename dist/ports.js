(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/* globals Elm, $ */
/* eslint-disable new-cap, no-underscore-dangle */

(function () {
  /**
   * If it's not a Maybe, returns whatever value that is, if it is
   * a Maybe, returns `value` for `Just value` and `null` for `Nothing`
   * @method fromMaybe
   * @param  {Object<Any> | Any } val
   * @return {Any}
   */
  var fromMaybe = function fromMaybe(val) {
    var isMaybe = val && val.ctor;

    if (!isMaybe) {
      return val;
    }

    return val._0 ? val._0 : null;
  };

  var parseElmList = function parseElmList(l) {
    if (Array.isArray(l)) {
      return l;
    }

    var list = [];
    var counter = 0;
    var key = '_' + counter;
    while (l[key] !== undefined && l[key].ctor !== '[]') {
      list = list.concat(l[key]);
      counter = counter + 1;
      key = '_' + counter;
    }

    return list;
  };

  /**
   * Creates an Elm acceptable Modal object
   * @method Modal
   * @param  {String} selector
   * @param  {String | Maybe String} targetUrl
   */
  var Modal = function Modal() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var selector = _ref.selector;
    var targetUrl = _ref.targetUrl;

    if (!selector) {
      // It was not set by Elm
      return null;
    }

    var url = fromMaybe(targetUrl);
    return { selector: selector, targetUrl: url };
  };

  /**
   * Creates an Elm acceptable HistoryState object
   * This is used to make the link Elm-JS and JS-Elm
   * @method HistoryState
   * @param  {String} url
   * @param  {Array<Modal>}
   */
  var HistoryState = function HistoryState(state) {
    var _ref2 = state || {};

    var url = _ref2.url;
    var openModals = _ref2.openModals;
    var sessionId = _ref2.sessionId;

    if (!url) {
      // It was not set by Elm
      return null;
    }

    var modals = parseElmList(openModals).map(Modal);
    modals.forEach(function (m) {
      if (!m) {
        throw new Error('A null modal was found in a history state. ' + ('Something is wrong. Here are all the modals ' + JSON.stringify(modals)));
      }
    });
    return { url: url, sessionId: sessionId, openModals: modals };
  };

  // =============================================================================

  // We will provide a unique id for our app
  var sessionId = Date.now();
  var app = Elm.ModalRouter.fullscreen(sessionId);

  // We send stuff to Elm with suggestions
  var _app$ports = app.ports;
  var onPopState = _app$ports.onPopState;
  var onModalOpen = _app$ports.onModalOpen;
  var onModalClose = _app$ports.onModalClose;


  window.addEventListener('popstate', function (e) {
    var histState = HistoryState(e.state);
    onPopState.send(histState);
  });

  function getModalInfo(e) {
    var targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href') ? e.relatedTarget.getAttribute('href') : null;

    var selector = '#' + e.target.id;
    var modalInfo = Modal({ selector: selector, targetUrl: targetUrl });
    return modalInfo;
  }

  $(document.body).on('show.bs.modal', function (e) {
    return onModalOpen.send(getModalInfo(e));
  }).on('hide.bs.modal', function (e) {
    var modal = getModalInfo(e);
    if (!modal) {
      throw new Error('Modal close event did not contain a modal. Something is wrong.');
    }
    onModalClose.send(modal.selector);
  });

  app.ports.reload.subscribe(function () {
    window.location.reload();
  });
})();

})));

//# sourceMappingURL=ports.js.map
