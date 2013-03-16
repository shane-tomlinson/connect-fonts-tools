/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs')
      mkdirp        = require('mkdirp'),
      ncp           = require('ncp').ncp,
      gen_readme    = require('./generate_readme'),
      gen_index     = require('./generate_index_js'),
      licenses      = require('./licenses'),
      directory_metadata
                    = require('./directory_metadata'),
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

/*
 * Process a directory.
 */
exports.process = function(sourcePath, targetPath, argv, done) {
  var fontTargetPath = path.join(targetPath, 'fonts', 'default');
  exports.prepareTarget(sourcePath, fontTargetPath, function(err) {
    if (err) return done(err);

    exports.metadata(fontTargetPath, function(err, metaInfo) {
      if (err) return done(err);

      generateReadme(targetPath, argv, metaInfo, function(err) {
        if (err) return done(err);

        generateIndex(targetPath, metaInfo, function(err) {
          if (err) return done(err);

        });
      });
    });
  });
};

function generateReadme(targetPath, argv, options, done) {
  gen_readme.write({
    target_dir: targetPath,
    author: {
      name: argv.an || options.common.designer,
      emails: argv.ae,
      urls: argv.au || options.common.url_designer,
      githubs: argv.ag,
      twitter: argv.at
    },
    package: {
      name: argv.pn,
      homepage: argv.ph || false,
      repourl: argv.pr || false,
      bugsurl: argv.pb || false
    },
    font: {
      names: argv.fn || Object.keys(options.fonts).join(','),
      family: argv.ff || options.common.font_family
    },
    credits: argv.c,
    license: argv.l ? licenses[argv.l] : {
      version: "2.0",
      name: options.common.license_desc,
      url: options.common.url_license
    }
  }, done);
}

function generateIndex(targetPath, metaInfo, done) {
  metaInfo.aliases = {};
  metaInfo.target_dir = targetPath;

  console.log(metaInfo);

  gen_index.write(metaInfo, done);
}

