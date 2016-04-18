/* globals $ */

export default utils = (function utils() {  // eslint-disable-line
  function getTargetUrl(el) {
    const targetUrl = el.getAttribute('href');
    const noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
    return (noRemoteUrl) ? null : targetUrl;
  }

  function toggleModalFromState(state, showHide) {
    if (!state || !state.targetModal) {
      return;
    }

    const target = document.querySelector(state.targetModal);
    if (!target) {
      throw new Error(`toggleModalFromState: No modal found with ${state.targetModal}`);
    }

    $(target).modal(showHide);
    console.log(`Imagine I am showing the modal with url ${state.modalUrl}`);
  }
  function showModalFromState(state) {
    toggleModalFromState(state, 'show');
  }

  function hideModalFromState(state) {
    toggleModalFromState(state, 'hide');
  }

  function modalFromStateIsShowing(state) {
    let modalIsShowing = false;
    if (!state) { return false; }
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

    keysA.forEach((key) => {
      if (!keyIsEquivalent(a, b, key)) { differences++; }
    });

    keysB.forEach((key) => {
      if (!keyIsEquivalent(a, b, key)) { differences++; }
    });

    return !differences;
  }

  return {
    getTargetUrl,
    showModalFromState,
    hideModalFromState,
    modalFromStateIsShowing,
    areEquivalentObjects,
  };
}());
