/* eslint-env es5 */
/* globals utils jQuery*/

var modalRouter = (function modalRouter($) { //eslint-disable-line
  var isInitialised = false;

  if (!$) {
    throw new Error('ModalRouter: No JQuery');
  }

  var stateHandler = (function stateHandler() {
    // The modalStatesStack keeps a record of all states that contain a modal
    // and that are behind from the current history position.
    var modalStatesStack = [];

    function push(newState, title, targetUrl) {
      if (typeof newState !== 'object') {
        throw new Error('stateTracker: Invalid state object.');
      }

      modalStatesStack.push(newState);
      window.history.pushState(newState, title, targetUrl);
    }

    function pop() {
      modalStatesStack.pop();
      window.history.back();
    }

    // The state can be ahead or behind
    function moveTo(state) {
      // If the state is ahead, then register it in the modalStatesStack
      var stateIndex = modalStatesStack.indexOf(state);
      var stateInStack = (stateIndex >= 0);
      if (!stateInStack) {
        modalStatesStack.push(state);
      } else {
        // If the state is behind, remove all states after it.
        modalStatesStack.splice(stateIndex + 1);
      }
    }

    function isInModalState() {
      return (modalStatesStack.length > 0);
    }

    // It is not called "getLastState" because there is no guarantee that
    // the there were no new states between after the lastModalState;
    function getLastModalState() {
      return modalStatesStack[modalStatesStack.length - 1];
    }

    return {
      push: push,
      pop: pop,
      isInModalState: isInModalState,
      getLastModalState: getLastModalState,
      moveTo: moveTo,
    };
  }());

  function onModalShow(e) {
    var modalButton = e.relatedTarget;
    if (!modalButton) {
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
    console.log('History change called');

    // Does the new history state have a modal?
    var newState = window.history.state;
    if (newState && newState.isModalState) {
      // If it does then display it and move the stateHandler to there
      utils.showModalFromState(newState);
      stateHandler.moveTo(newState);
    }

    // If it does not then check whether the modal is showing
    var lastModalState = stateHandler.getLastModalState();
    if (utils.modalFromStateIsShowing(lastModalState)) {
      // If it is showing, hide it
      // FIXME: this can cause potential problems
      // when changing states within an open modal.
      utils.hideModalFromState(lastModalState);
    }

    // Otherwise do nothing
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
