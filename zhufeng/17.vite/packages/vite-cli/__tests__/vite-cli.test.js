'use strict';

const viteCli = require('..');
const assert = require('assert').strict;

assert.strictEqual(viteCli(), 'Hello from viteCli');
console.info("viteCli tests passed");
