/*globals xDivTester*/

describe('My Module', function () {
  'use strict';

  it('initialises correctly', function () {
    var container = document.createElement('div');
    document.body.appendChild(container);

    expect(function () {
      xDivTester.callWith(container);
    }).not.toThrow();
  });
});
