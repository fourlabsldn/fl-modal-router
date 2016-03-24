
var utils = (function utils() {  // eslint-disable-line
  function getTargetUrl(el) {
    var targetUrl = el.getAttribute('href');
    var noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
    return (noRemoteUrl) ? null : targetUrl;
  }

  return {
    getTargetUrl: getTargetUrl,
  };
}());
