/* eslint-env jasmine */

import { assert } from './loader';

export default function assertSpecs() {
  describe('assert function should', () => {
    it('throw when given a false value and an empty string', () => {
      expect(() => { assert(false, ''); }).toThrow();
    });

    it('throw when given a false value and a non-empty string', () => {
      expect(() => { assert(false, 'asdf'); }).toThrow();
    });

    it('throw when given a false value and no second parameter', () => {
      expect(() => { assert(false); }).toThrow();
    });

    it('provide the appropriate error message', () => {
      const errorMsg = 'my error message';
      try {
        assert(false, errorMsg);
      } catch (e) {
        expect(e.message).toContain(errorMsg);
      }
    });

    it('not throw when given a true value and a non-empty error message', () => {
      expect(() => assert(true, 'asfd')).not.toThrow();
    });

    it('not throw when given a true value and an empty error message', () => {
      expect(() => assert(true, 'asfd')).not.toThrow();
    });

    it('not throw when given a true value and no error message', () => {
      expect(() => assert(true)).not.toThrow();
    });
  });


  describe('assert.warn function should', () => {
    beforeEach(() => {
      spyOn(console, 'warn');
    });

    it('warn when given a false value and an empty string', () => {
      assert.warn(false, '');
      expect(console.warn.calls.count()).toEqual(1);
    });

    it('warn when given a false value and a non-empty string', () => {
      assert.warn(false, 'asdf');
      expect(console.warn.calls.count()).toEqual(1);
    });

    it('warn when given a false value and no second parameter', () => {
      assert.warn(false);
      expect(console.warn.calls.count()).toEqual(1);
    });

    it('provide the appropriate warning message', () => {
      const warningMsg = 'my error message';
      assert.warn(false, warningMsg);
      expect(console.warn.calls.count()).toEqual(1);
      const warningThrown = console.warn.calls.argsFor(0);

      expect(warningThrown[0]).toContain(warningMsg);
    });

    it('not warn when given a true value and a non-empty error message', () => {
      assert.warn(true, 'asfd');
      expect(console.warn.calls.count()).toEqual(0);
    });

    it('not warn when given a true value and an empty error message', () => {
      assert.warn(true, 'asfd');
      expect(console.warn.calls.count()).toEqual(0);
    });

    it('not warn when given a true value and no error message', () => {
      assert.warn(true);
      expect(console.warn.calls.count()).toEqual(0);
    });
  });
}
