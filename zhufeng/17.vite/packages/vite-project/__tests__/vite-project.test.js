'use strict';

const viteProject = require('..');
const assert = require('assert').strict;

assert.strictEqual(viteProject(), 'Hello from viteProject');
console.info("viteProject tests passed");
