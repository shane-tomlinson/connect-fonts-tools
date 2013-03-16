#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      directory     = require('../lib/directory'),
      optimist      = require('optimist')
                          .describe('ff', 'font family')
                          .describe('an', 'Author name')
                          .describe('ae', 'Author email(s) - comma separated list if more than one')
                          .demand('ae')
                          .describe('au', 'Author url(s) - comma separated list if more than one')
                          .describe('at', 'Author twitter')
                          .describe('ag', 'Author github')
                          .describe('pn', 'Package name')
                          .demand('pn')
                          .describe('ph', 'Project homepage URL')
                          .describe('pr', 'Project repo URL')
                          .describe('pb', 'Project bug tracker URL')
                          .describe('c', 'Credits')
                          .usage('usage: ' + path.basename(__filename) +
                                ' <directory> <target_dir>'),
      argv          = optimist.argv;

var sourcePath = path.resolve(process.cwd(), argv._[0]);
var targetPath = path.resolve(process.cwd(), argv._[1]);
if (!(sourcePath && targetPath)) {
  optimist.showHelp();
  process.exit(1);
}

directory.process(sourcePath, targetPath, argv, function(err) {
  if (err) {
    console.error(String(err));
    process.exit(1);
  }
});


