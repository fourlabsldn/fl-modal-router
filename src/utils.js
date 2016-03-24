
var utils = (function utils() {  // eslint-disable-line
  function getTargetUrl(el) {
    var targetUrl = el.getAttribute('href');
    var noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
    return (noRemoteUrl) ? null : targetUrl;
  }

  function showModalFromState(state) {
    console.log('Imagine I am showing the modal with url ' + state.modalUrl);
    return;
  }

  return {
    getTargetUrl: getTargetUrl,
    showModalFromState: showModalFromState,
  };
}());
