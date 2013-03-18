/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      mkdirp        = require('mkdirp'),
      child_process = require('child_process');

exports.SUPPORTED_SUBSETS = [
  'latin',
  'latin-ext',
  'greek',
  'greek-ext',
  'cyrillic',
  'cyrillic-ext',
  'vietnamese'
];


exports.subset = function(subset, sourcePath, targetPath, done) {
  mkdirp(path.dirname(targetPath), function(err) {
    if (err) return done(err);

    spawn('python', [
      path.join(__dirname, 'ext', 'subset.py'),
      '--null',
      '--nmr',
      '--roundtrip',
      '--script',
      '--subset=' + subset,
      sourcePath,
      targetPath
    ], {}, done);
  });
}


function spawn(cmd, args, opts, done) {
  var child = child_process.spawn(cmd, args, opts);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', function(code) {
    if (code) {
      console.error(cmd + " exited with code " + code);
      process.exit(code);
    }
    done(null);
  });
}


