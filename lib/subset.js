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


exports.subset = function(subsets, sourcePath, targetPath, createDirForSubset, done) {
  subsets = [].concat(subsets);
  processNext();


  function processNext() {
    var subsetToCreate = subsets.shift();
    if (!subsetToCreate) return done();

    var subsetTargetPath = getSubsetTargetPath(sourcePath, targetPath,
          subsetToCreate, createDirForSubset);

    subset(subsetToCreate, sourcePath, subsetTargetPath, function(err) {
      if (err) return done(err);
      processNext();
    });
  }
};


function getSubsetTargetPath(sourcePath, targetPath,
             subset, createDirForSubset) {
  if (createDirForSubset) {
    return path.join(targetPath, subset, path.basename(sourcePath));
  }
  else {
    return path.join(targetPath, path.basename(sourcePath, '.ttf') + '-' + subset + '.ttf');
  }
}

function subset(subset, sourcePath, targetPath, done) {
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


