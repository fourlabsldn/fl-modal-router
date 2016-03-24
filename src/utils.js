/* globals $ */
var utils = (function utils() {  // eslint-disable-line
  function getTargetUrl(el) {
    var targetUrl = el.getAttribute('href');
    var noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
    return (noRemoteUrl) ? null : targetUrl;
  }

  function showModalFromState(state) {
    if (!state || !state.targetModal) {
      return;
    }

    var target = document.querySelector(state.targetModal);
    if (!target) {
      throw new Error('showModalFromState: No modal found with ' +
            state.targetModal);
    }

    $(target).modal('show');
    console.log('Imagine I am showing the modal with url ' + state.modalUrl);
    return;
  }

  return {
    getTargetUrl: getTargetUrl,
    showModalFromState: showModalFromState,
  };
}());
