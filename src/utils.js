/* globals $ */
var utils = (function utils() {  // eslint-disable-line
  function getTargetUrl(el) {
    var targetUrl = el.getAttribute('href');
    var noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
    return (noRemoteUrl) ? null : targetUrl;
  }

  function toggleModalFromState(state, showHide) {
    if (!state || !state.targetModal) {
      return;
    }

    var target = document.querySelector(state.targetModal);
    if (!target) {
      throw new Error('toggleModalFromState: No modal found with ' +
      state.targetModal);
    }

    $(target).modal(showHide);
    console.log('Imagine I am showing the modal with url ' + state.modalUrl);
  }
  function showModalFromState(state) {
    toggleModalFromState(state, 'show');
  }

  function hideModalFromState(state) {
    toggleModalFromState(state, 'hide');
  }

  function modalFromStateIsShowing(state) {
    var modalIsShowing = false;
    var modal;
    if (!state) { return false; }
    var modalQueryString = state.targetModal;
    modal = document.querySelector(modalQueryString);
    modalIsShowing = modal.classList.contains('in');
    return modalIsShowing;
  }
  function keyIsEquivalent(a, b, key) {
    var isEq = false;
    if (a[key] && b[key] && typeof a[key] === 'object') {
      var lengthKeyA = Object.keys(a[key]).length;
      var lengthKeyB = Object.keys(b[key]).length;
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

    var keysA = Object.keys(a);
    var keysB = Object.keys(b);

    var differences = 0;

    keysA.forEach(function f(key) {
      if (!keyIsEquivalent(a, b, key)) { differences++; }
    });

    keysB.forEach(function f(key) {
      if (!keyIsEquivalent(a, b, key)) { differences++; }
    });

    return !differences;
  }

  return {
    getTargetUrl: getTargetUrl,
    showModalFromState: showModalFromState,
    hideModalFromState: hideModalFromState,
    modalFromStateIsShowing: modalFromStateIsShowing,
    areEquivalentObjects: areEquivalentObjects,
  };
}());
