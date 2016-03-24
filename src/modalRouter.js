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

    function isPastState(state) {
      if (!state) { return false; }
      var indexOfFound = -1;

      // Loop through modalStatesStack comparing state keys.
      modalStatesStack.forEach(function m(stackState, stateIndex) {
        if (utils.areEquivalentObjects(state, stackState) === true) {
          indexOfFound = stateIndex;
        }
      });

      return (indexOfFound >= 0);
    }

    return {
      push: push,
      isInModalState: isInModalState,
      getLastModalState: getLastModalState,
      moveTo: moveTo,
      isPastState: isPastState,
    };
  }());

  function onModalShow(e) {
    // Did it show as a result of a state change?
    var currState = window.history.state;
    if (currState && currState.isModalState) {
      // If it did then there is nothing else to be done.
      return;
    }

    // Otherwise, then create a new history record with data about this modal.
    var modalButton = e.relatedTarget;
    if (!modalButton) {
      return;
    }

    var targetUrl = utils.getTargetUrl(modalButton);
    if (!targetUrl) {
      console.log('No target url');
      return;
    }

    var targetModal = modalButton.dataset.target;
    if (!targetModal) {
      console.error('ModalRouter: No target modal specified.');
      return;
    }

    var title = '';
    var state = {
      isModalState: true,
      targetModal: targetModal,
      targetUrl: targetUrl,
      prevState: window.history.state,
      prevUrl: window.location.pathname,
    };

    stateHandler.push(state, title, targetUrl);
  }

  function onModalHide() {
    // Did it hide as a result of a state change?
    var currState = window.history.state;
    if (!currState || !currState.isModalState) {
      // If it did then there is nothing else to be done.
      return;
    }

    // If it didn't then let's add to the history
    var lastModalState = stateHandler.getLastModalState();
    if (!lastModalState) { return; }
    var state = lastModalState.prevState;
    var url = lastModalState.prevUrl;
    var title = '';
    window.history.pushState(state, title, url);
  }

  function onHistoryChange() {
    console.log('History change called');

    // Is the new history state one of the past ones we created?
    var newState = window.history.state;
    console.log(newState);
    var isPastState = stateHandler.isPastState(newState);

    var modalShowing;
    if (isPastState) {
      // If it is, then let's make sure the modal is open.
      modalShowing = utils.modalFromStateIsShowing(newState);
      if (!modalShowing) {
        utils.showModalFromState(newState);
        return;
      }
    }

    // If it isn't let's see if it has a different URL from our last recorded state
    var lastModalState = stateHandler.getLastModalState();
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
