/* globals $ */

var utils$1 = utils = function utils() {
  // eslint-disable-line
  function getTargetUrl(el) {
    const targetUrl = el.getAttribute('href');
    const noRemoteUrl = !targetUrl || targetUrl === '#' || targetUrl === '';
    return noRemoteUrl ? null : targetUrl;
  }

  function toggleModalFromState(state, showHide) {
    if (!state || !state.targetModal) {
      return;
    }

    const target = document.querySelector(state.targetModal);
    if (!target) {
      throw new Error(`toggleModalFromState: No modal found with ${ state.targetModal }`);
    }

    $(target).modal(showHide);
    console.log(`Imagine I am showing the modal with url ${ state.modalUrl }`);
  }
  function showModalFromState(state) {
    toggleModalFromState(state, 'show');
  }

  function hideModalFromState(state) {
    toggleModalFromState(state, 'hide');
  }

  function modalFromStateIsShowing(state) {
    let modalIsShowing = false;
    if (!state) {
      return false;
    }
    const modalQueryString = state.targetModal;
    const modal = document.querySelector(modalQueryString);
    modalIsShowing = modal.classList.contains('in');
    return modalIsShowing;
  }
  function keyIsEquivalent(a, b, key) {
    let isEq = false;
    if (a[key] && b[key] && typeof a[key] === 'object') {
      const lengthKeyA = Object.keys(a[key]).length;
      const lengthKeyB = Object.keys(b[key]).length;
      isEq = lengthKeyA === lengthKeyB;
    } else {
      isEq = a[key] === b[key];
    }

    return isEq;
  }

  function areEquivalentObjects(a, b) {
    if (!a || typeof a !== 'object' || !b || typeof b !== 'object') {
      return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    let differences = 0;

    keysA.forEach(key => {
      if (!keyIsEquivalent(a, b, key)) {
        differences++;
      }
    });

    keysB.forEach(key => {
      if (!keyIsEquivalent(a, b, key)) {
        differences++;
      }
    });

    return !differences;
  }

  return {
    getTargetUrl,
    showModalFromState,
    hideModalFromState,
    modalFromStateIsShowing,
    areEquivalentObjects
  };
}();

function modalRouter($) {
  //eslint-disable-line
  let isInitialised = false;

  if (!$) {
    throw new Error('ModalRouter: No JQuery');
  }

  const stateHandler = function stateHandler() {
    // The modalStatesStack keeps a record of all states that contain a modal
    // and that are behind from the current history position.
    const modalStatesStack = [];

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
      const stateIndex = modalStatesStack.indexOf(state);
      const stateInStack = stateIndex >= 0;
      if (!stateInStack) {
        modalStatesStack.push(state);
      } else {
        // If the state is behind, remove all states after it.
        modalStatesStack.splice(stateIndex + 1);
      }
    }

    function isInModalState() {
      return modalStatesStack.length > 0;
    }

    // It is not called "getLastState" because there is no guarantee that
    // the there were no new states between after the lastModalState;
    function getLastModalState() {
      return modalStatesStack[modalStatesStack.length - 1];
    }

    function isPastState(state) {
      if (!state) {
        return false;
      }
      let indexOfFound = -1;

      // Loop through modalStatesStack comparing state keys.
      modalStatesStack.forEach((stackState, stateIndex) => {
        if (utils$1.areEquivalentObjects(state, stackState) === true) {
          indexOfFound = stateIndex;
        }
      });

      return indexOfFound >= 0;
    }

    return { push, isInModalState, getLastModalState, moveTo, isPastState };
  }();

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

    const targetUrl = utils$1.getTargetUrl(modalButton);
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
      prevUrl: window.location.pathname
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
    if (!lastModalState) {
      return;
    }
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
      modalShowing = utils$1.modalFromStateIsShowing(newState);
      if (!modalShowing) {
        utils$1.showModalFromState(newState);
        return;
      }
    }

    // If it isn't let's see if it has a different URL from our last recorded state
    const lastModalState = stateHandler.getLastModalState();
    if (lastModalState && window.location.pathname === lastModalState.targetUrl) {
      // If it is the same URL then we don't need to change anything.
      return;
    }

    // if the url is different let's check whether its modal is showing up
    modalShowing = utils$1.modalFromStateIsShowing(lastModalState);
    // if it is, then hide it.
    if (modalShowing) {
      utils$1.hideModalFromState(lastModalState);
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
    init
  };
}

const router = modalRouter(jQuery);
router.init();