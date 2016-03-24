(function () {/* eslint-env es5 */
/* globals $ */

function getTargetUrl(el) {
  var targetUrl = el.getAttribute('href');
  var noRemoteUrl = (!targetUrl || targetUrl === '#' || targetUrl === '');
  return (noRemoteUrl) ? null : targetUrl;
}

window.addEventListener('load', function ModalRouter() {
  console.log('called');
  $(document.body).on('show.bs.modal', function showModalRoute(e) {
    var modalButton = e.relatedTarget;
    if (!modalButton) { throw new Error('ModalRouter: No target button.'); }

    var targetUrl = getTargetUrl(modalButton);
    if (!targetUrl) { console.log('No target url'); return; }
    targetUrl = '/modalOpen';

    var targetModal = modalButton.dataset.target;
    if (!targetModal) {throw new Error('ModalRouter: No target modal specified.'); }

    var state = {
      target_modal: targetModal,
      target_url: targetUrl,
    };

    var title = '';

    history.pushState(state, title, targetUrl);

    console.dir(e);
  });

  $(document.body).on('hide.bs.modal', function hideModalRoute(e) {
    console.dir(e);
  });
});

/* global xController */
/* eslint-env browser */

xController(function flFormBuilder(xDivEl) {
  xDivEl.innerText = "I'm working, bitches!";
  console.log('Worked?');
});
}());