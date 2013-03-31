/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      mkdirp        = require('mkdirp'),
      child_process = require('child_process');


exports.SUPPORTED_SUBSETS = [
  'latin',
  /*
  'latin-ext',
  'greek',
  'greek-ext',
  'cyrillic',
  'cyrillic-ext',
  'vietnamese',
  'en',
  'es',
  'de',
  'fr',
  'ascii'*/
];

exports.subset = function(subsets, sourcePath, targetPath, createDirForSubset, done) {
  var targetPaths = [];
  subsets = [].concat(subsets);
  processNext();


  function processNext() {
    var subsetToCreate = subsets.shift();
    if (!subsetToCreate) return done(null, targetPaths);

    var subsetTargetPath = getSubsetTargetPath(sourcePath, targetPath,
          subsetToCreate, createDirForSubset);
    targetPaths.push(subsetTargetPath);

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

    args = [
      path.join(__dirname, 'ext', 'subset.py'),
      '--null',
      '--nmr',
      '--roundtrip',
      '--script',
      '--subset=' + subset,
      sourcePath,
      targetPath
    ];
    spawn('python', args, {}, done);

  });

}

function spawn(cmd, args, opts, done) {
  var child = child_process.spawn(cmd, args, opts);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', function(code) {
    if (code) {
      var msg = cmd + " exited with code " + code;
      console.error(msg);
      done(new Error(msg));
    }
    done(null);
  });
}


