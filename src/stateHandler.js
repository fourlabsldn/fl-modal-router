const stateHandler = (function stateHandler() {
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
    const stateInStack = (stateIndex >= 0);
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
    let indexOfFound = -1;

    // Loop through modalStatesStack comparing state keys.
    modalStatesStack.forEach((stackState, stateIndex) => {
      if (utils.areEquivalentObjects(state, stackState) === true) {
        indexOfFound = stateIndex;
      }
    });

    return (indexOfFound >= 0);
  }

  return { push, isInModalState, getLastModalState, moveTo, isPastState };
}());

export default stateHandler;
