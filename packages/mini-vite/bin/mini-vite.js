#!/usr/bin/env node

// require("../dist/index.js");
function start() {
  return import('../dist/node/cli.js')
}
start();