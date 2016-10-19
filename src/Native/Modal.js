/* global $*/
var _user$project$Native_Modal = {
  open: (selector) => {
    document.querySelector(selector);
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
