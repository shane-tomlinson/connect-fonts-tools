/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs            = require('fs-extra'),
      path          = require('path'),
      tmp           = require('tmp'),
      mkdirp        = require('mkdirp'),
      child_process = require('child_process');

tmp.setGracefulCleanup();

const WEB_FONTS_PROCESSOR_PATH = path.join(__dirname, '..', 'node_modules', '.bin', 'webfonts');

exports.write = function(fileName, targetPath, done) {
  if (path.extname(fileName).toLowerCase() !== '.ttf') {
    return done(new Error("not a ttf"));
  }

  tmp.dir(function(err, tmpPath) {
    var tmpFile = path.join(tmpPath, path.basename(fileName));
    fs.copy(fileName, tmpFile, function(err) {
      mkdirp(targetPath, function(err) {
        if (err) return done(err);

        spawn(WEB_FONTS_PROCESSOR_PATH, [tmpPath, '-o', targetPath], null, done);
      });
    });
  });


  function spawn(cmd, args, opts, done) {
    var child = child_process.spawn(cmd, args, opts);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', function(code) {
      if (code) return done(new Error("exited spawn with code: " + code));
      done(null);
    });
  }
};


