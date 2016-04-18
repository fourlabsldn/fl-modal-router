import assert from './assert';
import utils from './utils';

class StateHandler {
  constructor() {
    console.log('Statehandler Initialised');
  }

  generateStateObject(baseObj, stateUrl) {
    const state = baseObj || {};
    state.editedByModalRouter = true;

    // The lastNoModalUrl will be the same one as the one from
    // the state this state will replace.
    // TODO: When to change the lastNoModalUrl to the current one?
    const currState = this.getCurrentState() || {};
    state.lastNoModalUrl = currState.lastNoModalUrl || window.location.href;

    const openModalSelector = utils.getOpenModalSelector();
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

  createNewState(stateUrl) {
    const newState = this.generateStateObject({}, stateUrl);
    this.pushState(newState);
  }

  editCurrentState() {
    const state = this.getCurrentState();
    if (this.isEdited(state)) { return; }
    const newState = this.generateStateObject(state);
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
export default stateHandler;
