/* global $*/
var _user$project$Native_Modal = {
  open: (modal) => {
    const selector = modal.selector;
    const targetUrl = fromMaybe(modal.targetUrl);

    document.querySelector(selector);

    // We will try to load the remote content and in doing so
    // we will try to put it in the correct container
    // even though this may not always be possible.
    if (targetUrl) {
      const contentWrapper = $(`${selector} .modal-content`)
        || $(selector).children().first()
        || $(selector);

      contentWrapper.load(targetUrl);
    }
    $(selector).modal('show');
  },
  close: (selector) => {
    document.querySelector(selector);
    $(selector).modal('hide');
  },
  getOpen: () => {
    return ['myId']; // TODO: implement this
  },
};
