import assert from './assert';
import utils from './utils';

// -------- Private methods ------------ //
/**
 * @function generateStateObject
 * @param  {Object} lastEditedState This can be the current or the previous state
 * 																	depending on whether the current state was already
 * 																	edited or not.
 * @param  {String} stateUrl
 * @param  {Object} baseObj         Other routines may be editing the history
 *                                  	too, so let's use whatever is in the history
 *                                   	object as a baseObj and just extend that.
 * @return {Object}                 The state object ready to go the history api
 */
function generateStateObject(lastEditedState, stateUrl, baseObj) {
  const state = baseObj || {};
  state.editedByModalRouter = true;

  const openModalSelector = utils.getOpenModalSelector();
  const currState = getCurrentState() || {};

  // TODO: change this edited check to use the class' routine.
  if (!openModalSelector && !currState.editedByModalRouter) {
    // If the modal is closed and the current state hasn't been edited, then
    // it is a new state without a modal.
    state.lastNoModalUrl = window.location.href;
  } else if (lastEditedState) {
    // For all other cases the lastNoModalUrl is the same as from previous states.
    state.lastNoModalUrl = lastEditedState.lastNoModalUrl;
  } else {
    // It should never come here. There should never be a case when
    // the modal is open but there is no last edited state or that the modal
    // is closed and there is a currState edited but not a lastStateEdited.
    assert(false, 'Unexpected route in modal router.');
  }

  if (openModalSelector) {
    state.modalSelector = openModalSelector;
    state.targetUrl = stateUrl || window.location.href;
  } else {
    // If there is no modal open, then the current url is the last
    // one without a modal.
    state.modalSelector = null;
    state.targetUrl = state.lastNoModalUrl;
  }

  return state;
}

function replaceState(state) {
  assert(state && state.targetUrl, 'No state or target URL provided.');
  window.history.replaceState(state, '', state.targetUrl);
}

function pushState(state) {
  assert(state && state.targetUrl, 'No state or target URL provided.');
  window.history.pushState(state, '', state.targetUrl);
}

function getCurrentState() {
  return window.history.state;
}

// -------- Class and public methods ------------ //
class StateHandler {
  constructor() {
    console.log('Statehandler Initialised');

    // Keeping track of the lastEditedState will allow us to make sure
    // that we never lose a reference to the lastNoModalUrl. Even if a new
    // null state comes in which has the modal open, we will still be able to
    // get the lastNoModalUrl from the lastEditedState.
    this.lastEditedState = null;
  }

  createNewState(stateUrl) {
    const newState = generateStateObject(this.lastEditedState, stateUrl);
    pushState(newState);
    this.lastEditedState = newState;
  }

  editCurrentState() {
    const state = getCurrentState();
    if (this.isEdited(state)) { return; }
    const newState = generateStateObject(this.lastEditedState, null, state);
    replaceState(newState);
    this.lastEditedState = newState;
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
      utils.showModal(stateModal, state.targetUrl);
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
}

const stateHandler = new StateHandler();
export default stateHandler;
