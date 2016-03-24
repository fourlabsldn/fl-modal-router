/* eslint-env es5 */
/* globals utils */

var modalRouter = (function modalRouter($) {
  var isInitialised = false;

  if (!$) {
    throw new Error('ModalRouter: No JQuery');
  }

  var stateHandler = (function stateHandler() {
    function push(newState, title, targetUrl) {
      if (typeof newState !== 'object') {
        throw new Error('stateTracker: Invalid state object.');
      }

      window.history.pushState(newState, title, targetUrl);
    }

    function pop() {
      window.history.back();
    }

    return {
      push: push,
      pop: pop,
    };
  }());

  function onModalShow(e) {
    var modalButton = e.relatedTarget;
    if (!modalButton) {
      console.error('ModalRouter: No target button.');
      return;
    }

    var targetUrl = utils.getTargetUrl(modalButton);
    if (!targetUrl) {
      console.log('No target url');
      return;
    }
    targetUrl = '/modalOpen';

    var targetModal = modalButton.dataset.target;
    if (!targetModal) {
      throw new Error('ModalRouter: No target modal specified.');
    }

    var title = '';
    var state = {
      isModalState: true,
      targetModal: targetModal,
      targetUrl: targetUrl,
    };

    stateHandler.push(state, title, targetUrl);
  }

  function onModalHide() {
    stateHandler.pop();
  }

  function onHistoryChange() {
    var newState = window.history.state;
    if (newState && newState.isModalState) {
      utils.showModalFromState(newState);
    }

    return;
  }

  function init() {
    // Set initialisation state
    if (isInitialised) {
      return;
    }
    isInitialised = true;

    // Check if body was loaded, if it wasn't then come back when it has;
    var body = document.body;
    if (!body) {
      isInitialised = false;
      window.addEventListener('load', init);
      return;
    }

    var $body = $(body);
    window.addEventListener('popstate', onHistoryChange);
    $body.on('show.bs.modal', onModalShow);
    $body.on('hide.bs.modal', onModalHide);
  }

  return {
    init: init,
  };
}(jQuery));
