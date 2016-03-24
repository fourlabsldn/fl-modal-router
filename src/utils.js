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

  return {
    getTargetUrl: getTargetUrl,
    showModalFromState: showModalFromState,
    hideModalFromState: hideModalFromState,
    modalFromStateIsShowing: modalFromStateIsShowing,
  };
}());
