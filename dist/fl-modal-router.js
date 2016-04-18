var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
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

babelHelpers;

// Bug checking function that will throw an error whenever
// the condition sent to it is evaluated to false
function assert(condition, errorMessage) {

  if (!condition) {
    var completeErrorMessage = '';

    if (assert.caller && assert.caller.name) {
      completeErrorMessage = assert.caller.name + ': ';
    }

    completeErrorMessage += errorMessage;
    throw new Error(completeErrorMessage);
  }
}

function getOpenModalSelector() {
  var pageModalsLiveCol = document.querySelectorAll('.modal');
  var pageModals = Array.from(pageModalsLiveCol);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = pageModals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var modal = _step.value;

      // Check whether the modal is open.
      if (modal.classList.contains('in')) {
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
    // TODO: use xmlhttpRequest
    fetch(targetUrl).then(function (data) {
      return data.text();
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

var StateHandler = function () {
  function StateHandler() {
    babelHelpers.classCallCheck(this, StateHandler);

    console.log('Statehandler Initialised');
  }

  babelHelpers.createClass(StateHandler, [{
    key: 'generateStateObject',
    value: function generateStateObject(baseObj, stateUrl) {
      var state = baseObj || {};
      state.editedByModalRouter = true;

      // The lastNoModalUrl will be the same one as the one from
      // the state this state will replace.
      // TODO: When to change the lastNoModalUrl to the current one?
      var currState = this.getCurrentState() || {};
      state.lastNoModalUrl = currState.lastNoModalUrl || window.location.href;

      var openModalSelector = utils.getOpenModalSelector();
      if (openModalSelector) {
        state.modalSelector = openModalSelector;
        state.targetUrl = stateUrl || window.location.href;
      } else {
        // If there is no modal open, then the current url is the last
        // one without a modal.
        state.modalSelector = null;
        state.targetUrl = state.lastNoModalUrl;
      }

      return state;
    }
  }, {
    key: 'createNewState',
    value: function createNewState(stateUrl) {
      var newState = this.generateStateObject({}, stateUrl);
      this.pushState(newState);
    }
  }, {
    key: 'editCurrentState',
    value: function editCurrentState() {
      var state = this.getCurrentState();
      if (this.isEdited(state)) {
        return;
      }
      var newState = this.generateStateObject(state);
      this.replaceState(newState);
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
  }, {
    key: 'replaceState',
    value: function replaceState(state) {
      assert(state && state.targetUrl, 'No state or target URL provided.');
      window.history.replaceState(state, '', state.targetUrl);
    }
  }, {
    key: 'pushState',
    value: function pushState(state) {
      assert(state && state.targetUrl, 'No state or target URL provided.');
      window.history.pushState(state, '', state.targetUrl);
    }
  }, {
    key: 'getCurrentState',
    value: function getCurrentState() {
      return window.history.state;
    }
  }]);
  return StateHandler;
}();

var stateHandler = new StateHandler();

function modalRouter($) {
  var isInitialised = void 0;

  function onHistoryChange(popStateEvent) {
    console.log('History state change');
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
      console.log('hidden');
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