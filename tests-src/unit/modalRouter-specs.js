/* eslint-env jasmine */
/* globals jQuery, $ */

import {
  modalRouter,
  stateHandler,
} from './loader';

const NEW_STATE_EVENT = 'popstate';
const OPEN_MODAL_EVENT = 'shown.bs.modal';
const CLOSE_MODAL_EVENT = 'hidden.bs.modal';


export default function modalRouterSpecs() {
  describe('The modalRouter function should', () => {
    beforeEach((done) => {
      spyOn(stateHandler, 'editCurrentState');
      spyOn(stateHandler, 'createNewState');
      done();
    });

    it('edit the current state when initialising', (done) => {
      const router = modalRouter(jQuery);
      router.init();
      expect(stateHandler.editCurrentState.calls.count()).toEqual(1);
      done();
    });

    it('edit the current state when a new state is pushed', (done) => {
      function myListener() {
        expect(stateHandler.editCurrentState.calls.count()).toEqual(1);
        done();
        window.removeEventListener(NEW_STATE_EVENT, myListener);
      }
      // This is assuming that the modalRouter module will be called before our listener.
      window.addEventListener(NEW_STATE_EVENT, myListener);
      const ev = new Event(NEW_STATE_EVENT);
      window.dispatchEvent(ev);
    });

    xit('create a new state when a modal is open', (done) => {
      const $body = $(document.body);
      function myListener() {
        $body.off(OPEN_MODAL_EVENT, myListener);
        expect(stateHandler.createNewState.calls.count()).toEqual(1);
        done();
      }

      // This is assuming that the modalRouter module will be called before our listener.
      $body.on(OPEN_MODAL_EVENT, myListener);
      $body.trigger(OPEN_MODAL_EVENT);
    });

    xit('create a new state when a modal is closed', (done) => {
      const $body = $(document.body);
      function myListener() {
        $body.off(CLOSE_MODAL_EVENT, myListener);
        expect(stateHandler.createNewState.calls.count()).toEqual(1);
        done();
      }
      // This is assuming that the modalRouter module will be called before our listener.
      // This is assuming that the modalRouter module will be called before our listener.
      $body.on(CLOSE_MODAL_EVENT, myListener);
      $body.trigger(CLOSE_MODAL_EVENT);
    });
  });
}
