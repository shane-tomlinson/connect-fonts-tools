/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs')
      mkdirp        = require('mkdirp'),
      ncp           = require('ncp').ncp,
      directory_metadata
                    = require('../lib/directory_metadata'),
      normalize_filenames
                    = require('./normalize_filenames');

/*
 * Copy source path to target path. Create target if needed.
 * Normalize all filenames in target. Leaves original directory untouched.
 */
exports.prepareTarget = function(sourcePath, targetPath, done) {
  mkdirp(targetPath, function(err) {
    if (err) return done(err);

    ncp(sourcePath, targetPath, function(err) {
      if (err) return done(err);

      normalize_filenames(targetPath, false, done);
    });
  });
};

/*
 * get the metadata for a directory.
 */
exports.metadata = directory_metadata;

