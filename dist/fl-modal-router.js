(function () {
// Bug checking function that will throw an error whenever
// the condition sent to it is evaluated to false

function processCondition(condition, errorMessage) {
  if (!condition) {
    var completeErrorMessage = '';

    // The assert function is calling this processCondition and we are
    // really interested is in who is calling the assert function.
    var assertFunction = processCondition.caller;

    if (!assertFunction) {
      // The program should never ever ever come here.
      throw new Error('No "assert" function as a caller?');
    }

    if (assertFunction.caller && assertFunction.caller.name) {
      completeErrorMessage = assertFunction.caller.name + ': ';
    }

    completeErrorMessage += errorMessage;
    return completeErrorMessage;
  }

  return null;
}

function assert() {
  var error = processCondition.apply(undefined, arguments);
  if (typeof error === 'string') {
    throw new Error(error);
  }
}

assert.warn = function warn() {
  var error = processCondition.apply(undefined, arguments);
  if (typeof error === 'string') {
    console.warn(error);
  }
};

assert($, 'jQuery not initialised.');

function modalIsOpen(modal) {
  return window.getComputedStyle(modal).display !== 'none';
}

// TODO: this should return a better selector than just an ID.
function getOpenModalSelector() {
  var pageModalsLiveCol = document.querySelectorAll('.modal');
  var pageModals = Array.from(pageModalsLiveCol);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = pageModals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var modal = _step.value;

      if (modalIsOpen(modal)) {
        // If it is open, then return its id.
        return '#' + modal.id;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
}

function hideModal(modal) {
  $(modal).modal('hide');
}

function showModal(modal, targetUrl) {
  // Hide any backdrops that may remain.
  var backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = backdrops[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var backdrop = _step2.value;

      backdrop.remove();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  if (targetUrl) {
    // NOTE: the 'request' API does not send cookies with the request,
    // that's why we are using this one instead.
    new Promise(function (resolve, reject) {
      $.ajax({
        type: 'get',
        url: targetUrl,
        cache: true,
        success: resolve,
        failure: reject
      });
    }).then(function (content) {
      // By the time this finishes loading, the modal may already have
      // disappeared.
      var modalWasRemoved = !modal;
      var pageMovedOnToAnotherAddress = !window.history.state || window.history.state.targetUrl !== targetUrl;

      if (modalWasRemoved || pageMovedOnToAnotherAddress) {
        return;
      }
      var modalBody = modal.querySelector('.modal-content');
      assert(modalBody, 'Modal body not found.');
      modalBody.innerHTML = content;
    });
  }

  // Show the modal
  var modalObj = $(modal).modal();
  modalObj.modal('show');
}

var utils = {
  getOpenModalSelector: getOpenModalSelector,
  hideModal: hideModal,
  showModal: showModal
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

// -------- Private methods ------------ //
/**
 * @function generateStateObject
 * @param  {Object} lastEditedState This can be the current or the previous state
 * 																	depending on whether the current state was already
 * 																	edited or not.
 * @param  {String} stateUrl
 * @param  {Object} baseObj         Other routines may be editing the history
 *                                  	too, so let's use whatever is in the history
 *                                   	object as a baseObj and just extend that.
 * @return {Object}                 The state object ready to go the history api
 */
function generateStateObject(lastEditedState, stateUrl, baseObj) {
  var state = baseObj || {};
  state.editedByModalRouter = true;

  var openModalSelector = utils.getOpenModalSelector();
  var currState = getCurrentState() || {};

  // TODO: change this edited check to use the class' routine.
  if (!openModalSelector && !currState.editedByModalRouter) {
    // If the modal is closed and the current state hasn't been edited, then
    // it is a new state without a modal.
    state.lastNoModalUrl = window.location.href;
  } else if (lastEditedState) {
    // For all other cases the lastNoModalUrl is the same as from previous states.
    state.lastNoModalUrl = lastEditedState.lastNoModalUrl;
  } else if (currState.editedByModalRouter) {
    // If page is reloaded lastEditedState is lost but currState is preserved,
    // so let's make use of it.
    state.lastNoModalUrl = currState.lastNoModalUrl;
  } else {
    // It should never come here. There should never be a case when
    // the modal is open but there is no last edited state or that the modal
    // is closed and there is a currState edited but not a lastStateEdited.
    assert.warn(false, 'Unexpected route in modal router.');

    // However, in the rare case that a page loads with a modal open,
    // let's make sure to cater for that too.
    state.lastNoModalUrl = null;
  }

  if (openModalSelector) {
    state.modalSelector = openModalSelector;
    state.targetUrl = stateUrl || window.location.href;
  } else {
    // If there is no modal open, then the current url is the last
    // one without a modal.
    state.modalSelector = null;

    // For the rare case when we don't have any record of a state with
    // a url without a modal, let's provide the current URL as a fallback
    state.targetUrl = state.lastNoModalUrl || window.location.href;
  }

  return state;
}

function replaceState(state) {
  assert(state, 'No state provided.');
  assert(state.targetUrl, 'No target URL provided.');
  window.history.replaceState(state, '', state.targetUrl);
}

function pushState(state) {
  assert(state, 'No state provided.');
  assert(state.targetUrl, 'No target URL provided.');
  window.history.pushState(state, '', state.targetUrl);
}

function getCurrentState() {
  return window.history.state;
}

// -------- Class and public methods ------------ //

var StateHandler = function () {
  function StateHandler() {
    classCallCheck(this, StateHandler);

    // Keeping track of the lastEditedState will allow us to make sure
    // that we never lose a reference to the lastNoModalUrl. Even if a new
    // null state comes in which has the modal open, we will still be able to
    // get the lastNoModalUrl from the lastEditedState.
    this.lastEditedState = null;
  }

  createClass(StateHandler, [{
    key: 'createNewState',
    value: function createNewState(stateUrl) {
      var newState = generateStateObject(this.lastEditedState, stateUrl);
      pushState(newState);
      this.lastEditedState = newState;
    }
  }, {
    key: 'editCurrentState',
    value: function editCurrentState() {
      var state = getCurrentState();
      if (this.isEdited(state)) {
        return;
      }
      var newState = generateStateObject(this.lastEditedState, null, state);
      replaceState(newState);
      this.lastEditedState = newState;
    }
  }, {
    key: 'isEdited',
    value: function isEdited(state) {
      return state && !!state.editedByModalRouter;
    }
  }, {
    key: 'enforceState',
    value: function enforceState(state) {
      assert(state, '${state} is not a valid state to be enforced');
      // Let's get any modal that is open.
      var currOpenModalSelector = utils.getOpenModalSelector();
      var currOpenModal = document.querySelector(currOpenModalSelector);

      // Let's try to get the modal used in the state description
      // if there is any modal in the state description.
      var stateModal = document.querySelector(state.modalSelector);

      // Is the modal that is open, the one that should be open?
      if (currOpenModal !== stateModal) {
        // If it isn't let's hide the wrong one if there is any
        utils.hideModal(currOpenModal);
        // and then open the right one if there is any to open.
        utils.showModal(stateModal, state.targetUrl);
      }
    }
  }, {
    key: 'isEnforced',
    value: function isEnforced(state) {
      // Let's get any modal that is open.
      var currOpenModalSelector = utils.getOpenModalSelector();
      var currOpenModal = document.querySelector(currOpenModalSelector);

      // Let's try to get the modal used in the state description
      // if there is any modal in the state description.
      var stateModal = document.querySelector(state.modalSelector);

      // If whatever is open (even if nothing is open and currOpenModal points
      // to null) is different from what should be open (even if nothing should
      // be open and stateModal points to null) then the state is not enforced.
      if (currOpenModal !== stateModal) {
        // if it isn't, then the state is not enforced.
        return false;
      }
      // Otherwise the state is enforced
      return true;
    }
  }]);
  return StateHandler;
}();

var stateHandler = new StateHandler();

function modalRouter($) {
  var isInitialised = void 0;

  function onHistoryChange(popStateEvent) {
    var state = popStateEvent.state;

    // Check if it is a state we added stuff to.
    if (!stateHandler.isEdited(state)) {
      // If it is not, then let's fill it with data about its
      // current state.
      stateHandler.editCurrentState();
    } else {
      // if it is, then let's make sure that the state of things
      // is the way it should be.
      stateHandler.enforceState(state);
    }
  }

  function onModalStateChange(e) {
    var state = window.history.state;
    assert(typeof state !== 'undefined', 'Unable to retrieve window state.');

    // First, the current window state should already have been edited by
    // our state handler. If it wasn't, then we have a bug.
    assert(stateHandler.isEdited(state), 'State should already have been edited.');

    // Let's check whether it was shown or hidden to enforce a state change.
    // If it was, the state is already enforced and there is nothing else to do.
    if (stateHandler.isEnforced(state)) {
      return;
    }

    // If it wasn't shown to enforce a state, then we need to create
    // a new History state to accomodate this modal state.
    var targetUrl = void 0;
    if (e.type === 'shown') {
      // If the modal is being shown our targetURL will be the modal's
      // remote URL, if it is loading one.
      var relatedTarget = e.relatedTarget;
      targetUrl = relatedTarget ? relatedTarget.getAttribute('href') : null;
    } else if (e.type === 'hidden') {
      targetUrl = null;
    } else {
      // Should never come here.
      assert(false, 'Error processing modal state. Not shown or hidden.');
    }

    // Now we are ready to create the new state with the right URL
    stateHandler.createNewState(targetUrl);
  }

  function init() {
    // Set initialisation state
    if (isInitialised) {
      return;
    }
    isInitialised = true;

    // Check if body was loaded, if it wasn't then come back when it has;
    var body = document.body;
    if (!body) {
      isInitialised = false;
      window.addEventListener('load', init);
      return;
    }

    var $body = $(document.body);
    window.addEventListener('popstate', onHistoryChange);
    $body.on('shown.bs.modal', onModalStateChange);
    $body.on('hidden.bs.modal', onModalStateChange);

    // Edit current state to start.
    stateHandler.editCurrentState();
  }

  return {
    init: init
  };
}

var router = modalRouter(jQuery);
router.init();
}());