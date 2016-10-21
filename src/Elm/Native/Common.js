/* globals Elm */
/* eslint-disable new-cap, no-underscore-dangle */


// This file provides common functions for other native modules


/**
 * If it's not a Maybe, returns whatever value that is, if it is
 * a Maybe, returns `value` for `Just value` and `null` for `Nothing`
 * @method fromMaybe
 * @param  {Object<Any> | Any } val
 * @return {Any}
 */
const fromMaybe = val => {
  const isMaybe = val && val.ctor;

  if (!isMaybe) {
    return val;
  }

  return val._0 ? val._0 : null;
};

const parseElmList = l => {
  if (Array.isArray(l)) {
    return l;
  }

  let list = []
  let counter = 0
  let key = `_${counter}`;
  while (l[key] !== undefined && l[key].ctor !== '[]') {
    list = list.concat(l[key]);
    counter = counter + 1
    key = `_${counter}`;
  }

  return list;
}

/**
 * Creates an Elm acceptable Modal object
 * @method Modal
 * @param  {String} selector
 * @param  {String | Maybe String} targetUrl
 */
const Modal = function ({ selector, targetUrl } = {}) {
  if (!selector) {
    // It was not set by Elm
    return null;
  }

  const url = fromMaybe(targetUrl);
  return { selector, targetUrl: url };
};

/**
 * Creates an Elm acceptable HistoryState object
 * This is used to make the link Elm-JS and JS-Elm
 * @method HistoryState
 * @param  {String} url
 * @param  {Array<Modal>}
 */
const HistoryState = function (state) {
  const { url, openModals, sessionId } = state || {};
  if (!url) {
    // It was not set by Elm
    return null;
  }

  const modals = parseElmList(openModals).map(Modal);
  modals.forEach(m => {
    if (!m) {
      throw new Error(
        'A null modal was found in a history state. '
        + `Something is wrong. Here are all the modals ${JSON.stringify(modals)}`
      );
    }
  });
  return { url, sessionId, openModals: modals };
};
