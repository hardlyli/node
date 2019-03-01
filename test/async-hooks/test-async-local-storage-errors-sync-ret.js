'use strict';
require('../common');
const assert = require('assert');
const { AsyncLocalStorage } = require('async_hooks');

// case 2 using *AndReturn calls (dual behaviors)
const asyncLocalStorage = new AsyncLocalStorage();
asyncLocalStorage.enable();
let i = 0;
process.setUncaughtExceptionCaptureCallback((err) => {
  ++i;
  assert.strictEqual(err.message, 'err2');
  assert.strictEqual(asyncLocalStorage.getStore().get('hello'), 'node');
});
try {
  asyncLocalStorage.runSyncAndReturn((val) => {
    const store = asyncLocalStorage.getStore();
    assert.strictEqual(val, 'str');
    store.set('hello', 'node');
    setTimeout(() => {
      process.nextTick(() => {
        assert.strictEqual(i, 1);
      });
      throw new Error('err2');
    }, 0);
    throw new Error('err1');
  }, 'str');
} catch (e) {
  assert.strictEqual(e.message, 'err1');
  assert.strictEqual(asyncLocalStorage.getStore(), undefined);
}
