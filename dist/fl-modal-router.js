// Bug checking function that will throw an error whenever
// the condition sent to it is evaluated to false
function assert(condition, errorMessage) {

  if (!condition) {
    let completeErrorMessage = '';

    if (assert.caller && assert.caller.name) {
      completeErrorMessage = assert.caller.name + ': ';
    }

    completeErrorMessage += errorMessage;
    throw new Error(completeErrorMessage);
  }
}

function getOpenModalSelector() {
  const pageModalsLiveCol = document.querySelectorAll('.modal');
  const pageModals = Array.from(pageModalsLiveCol);
  for (const modal of pageModals) {
    // Check whether the modal is open.
    if (modal.classList.contains('in')) {
      // If it is open, then return its id.
      return `#${ modal.id }`;
    }
  }
  return null;
}

function hideModal(modal) {
  $(modal).modal('hide');
}

function showModal(modal) {
  $(modal).modal('show');
}

var utils = {
  getOpenModalSelector,
  hideModal,
  showModal
};

class StateHandler {
  constructor() {
    console.log('Statehandler Initialised');
  }

  generateStateObject(baseObj, stateUrl) {
    const openModalSelector = utils.getOpenModalSelector();
    const state = baseObj || {};
    if (openModalSelector) {
      state.modalSelector = openModalSelector;
    }
    state.targetUrl = stateUrl || window.location.href;
    state.editedByModalRouter = true;
    return state;
  }

  createNewState(stateUrl) {
    const newState = this.generateStateObject({}, stateUrl);
    this.pushState(newState);
  }

  editCurrentState() {
    const state = this.getCurrentState();
    if (this.isEdited(state)) {
      return;
    }
    const newState = this.generateStateObject(state);
    this.pushState(newState);
    this.replaceState(newState);
  }

  isEdited(state) {
    return state && !!state.editedByModalRouter;
  }

  enforceState(state) {
    assert(state, '${state} is not a valid state to be enforced');
    // Let's get any modal that is open.
    const currOpenModalSelector = utils.getOpenModalSelector();
    const currOpenModal = document.querySelector(currOpenModalSelector);

    // Let's try to get the modal used in the state description
    // if there is any modal in the state description.
    const stateModal = document.querySelector(state.modalSelector);

    // Is the modal that is open, the one that should be open?
    if (currOpenModal !== stateModal) {
      // If it isn't let's hide the wrong one if there is any
      utils.hideModal(currOpenModal);
      // and then open the right one if there is any to open.
      utils.showModal(stateModal);
    }
  }

  isEnforced(state) {
    // Let's get any modal that is open.
    const currOpenModalSelector = utils.getOpenModalSelector();
    const currOpenModal = document.querySelector(currOpenModalSelector);

    // Let's try to get the modal used in the state description
    // if there is any modal in the state description.
    const stateModal = document.querySelector(state.modalSelector);

    // If whatever is open (even if nothing is open and currOpenModal points
    // to null) is different from what should be open (even if nothing should
    // be open and stateModal points to null) then the state is not enforced.
    if (currOpenModal !== stateModal) {
      // if it isn't, then the state is not enforced.
      return false;
    }
    // Otherwise the state is enforced
    return true;
  }

  replaceState(state) {
    assert(state && state.targetUrl, 'No state or target URL provided.');
    window.history.replaceState(state, '', state.targetUrl);
  }

  pushState(state) {
    assert(state && state.targetUrl, 'No state or target URL provided.');
    window.history.pushState(state, '', state.targetUrl);
  }

  getCurrentState() {
    return window.history.state;
  }
}

const stateHandler = new StateHandler();

function modalRouter($) {
  let isInitialised;

  function onHistoryChange(popStateEvent) {
    console.log('History state change');
    const state = popStateEvent.state;

    // Check if it is a state we added stuff to.
    if (!stateHandler.isEdited(state)) {
      // If it is not, then let's fill it with data about its
      // current state.
      stateHandler.editCurrentState();
    } else {
      // if it is, then let's make sure that the state of things
      // is the way it should be.
      stateHandler.enforceState(state);
    }
  }

  function onModalStateChange(e) {
    const state = window.history.state;
    assert(typeof state !== 'undefined', 'Unable to retrieve window state.');

    // First, the current window state should already have been edited by
    // our state handler. If it wasn't, then we have a bug.
    assert(stateHandler.isEdited(state), 'State should already have been edited.');

    // Let's check whether it was shown or hidden to enforce a state change.
    // If it was, the state is already enforced and there is nothing else to do.
    if (stateHandler.isEnforced(state)) {
      return;
    }

    // If it wasn't shown to enforce a state, then we need to create
    // a new History state to accomodate this modal state.
    // But first, let's get the remote url it is loading, if it is loading any.
    const relatedTarget = e.relatedTarget;
    const targetUrl = relatedTarget ? relatedTarget.getAttribute('href') : null;

    // Now we are ready to create the new state with the right URL
    stateHandler.createNewState(targetUrl);
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

    const $body = $(document.body);
    window.addEventListener('popstate', onHistoryChange);
    $body.on('shown.bs.modal', onModalStateChange);
    $body.on('hidden.bs.modal', onModalStateChange);

    // Edit current state to start.
    stateHandler.editCurrentState();
  }

  return {
    init
  };
}

const router = modalRouter(jQuery);
router.init();