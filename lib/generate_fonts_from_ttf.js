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

exports.write = function(sourcePath, targetPath, done) {
  fs.stat(sourcePath, function(err, stats) {
    if (err) return done(err);

    // If source is a directory, generate fonts for the entire directory.
    if (stats.isDirectory()) {
      generate(sourcePath);
    }
    else if (path.extname(sourcePath).toLowerCase() === '.ttf') {
      tmp.dir(function(err, tmpPath) {
        var tmpFile = path.join(tmpPath, path.basename(sourcePath));
        fs.copy(sourcePath, tmpFile, function(err) {
          if (err) return done(err);
          generate(tmpPath);
        });
      });
    }
    else {
      return done(new Error("sourcePath must be a .ttf or directory"));
    }
  });

  /*
   * Create a temporary directory to place the source font into or
   * else the webfonts tool tries to create fonts for all files in the
   * directory.
   */

  function generate(sourcePath) {
    mkdirp(targetPath, function(err) {
      if (err) return done(err);

      spawn(WEB_FONTS_PROCESSOR_PATH,
          [sourcePath, '-o', targetPath], null, done);
    });
  }


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


