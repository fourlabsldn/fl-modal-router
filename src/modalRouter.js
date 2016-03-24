/* eslint-env es5 */
/* globals $, utils */

var modalRouter = (function modalRouter() {
  var isInitialised = false;

  if (!$) { throw new Error('ModalRouter: No JQuery'); }

  function onModalShow(e) {
    var modalButton = e.relatedTarget;
    if (!modalButton) { throw new Error('ModalRouter: No target button.'); }

    var targetUrl = utils.getTargetUrl(modalButton);
    if (!targetUrl) { console.log('No target url'); return; }
    targetUrl = '/modalOpen';

    var targetModal = modalButton.dataset.target;
    if (!targetModal) { throw new Error('ModalRouter: No target modal specified.'); }

    var title = '';
    var state = {
      target_modal: targetModal,
      target_url: targetUrl,
    };

    window.history.pushState(state, title, targetUrl);
  }

  function onModalHide() {
    window.history.back();
  }

  function onHistoryForward() {

  }

  function onHistoryBack() {

  }

  function init() {
    // Set initialisation state
    if (isInitialised) { return; }
    isInitialised = true;

    // Check if body was loaded, if it wasn't then come back when it has;
    var body = document.body;
    if (!body) {
      isInitialised = false;
      window.addEventListener('load', init);
      return;
    }

    var $body = $(body);
    window.addEventListener('popstate', onHistoryBack);
    $body.on('show.bs.modal', onModalShow);
    $body.on('hide.bs.modal', onModalHide);
  }

  return {
    init: init,
  };
}());
