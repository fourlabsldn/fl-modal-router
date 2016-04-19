import stateHandler from './stateHandler';
import assert from './assert.js';

export default function modalRouter($) {
  let isInitialised;

  function onHistoryChange(popStateEvent) {
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
    if (stateHandler.isEnforced(state)) { return; }

    // If it wasn't shown to enforce a state, then we need to create
    // a new History state to accomodate this modal state.
    let targetUrl;
    if (e.type === 'shown') {
      // If the modal is being shown our targetURL will be the modal's
      // remote URL, if it is loading one.
      const relatedTarget = e.relatedTarget;
      targetUrl = (relatedTarget) ? relatedTarget.getAttribute('href') : null;
    } else if (e.type === 'hidden') {
      targetUrl = null;
    } else {
      // Should never come here.
      assert(false, 'Error processing modal state. Not shown or hidden.');
    }

    // Now we are ready to create the new state with the right URL
    stateHandler.createNewState(targetUrl);
  }

  function init() {
    // Set initialisation state
    if (isInitialised) { return; }
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
    init,
  };
}
