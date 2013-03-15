#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs')
      mkdirp        = require('mkdirp'),
      ncp           = require('ncp').ncp,
      directory_metadata
                    = require('../lib/directory_metadata'),
      gen_readme    = require('../lib/generate_readme'),
      normalize_filenames
                    = require('../lib/normalize_filenames'),
      licenses      = require('../lib/licenses'),
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

function checkError(err) {
  if (err) {
    console.error(String(err));
    process.exit(1);
  }
}

/*
 * Copy source path to target path. Create target if needed.
 * Normalize all filenames in target. Leaves original directory untouched.
 */
function prepareTargetDirectory(sourcePath, targetPath, done) {
  mkdirp(targetPath, function(err) {
    if (err) return done(err);

    ncp(sourcePath, targetPath, function(err) {
      if (err) return done(err);

      normalize_filenames(targetPath, false, done);
    });
  });
}

function generateReadme(targetPath, argv, metaInfo, done) {
  gen_readme.write({
    target_dir: targetPath,
    author: {
      name: argv.an || metaInfo.general.designer,
      emails: argv.ae,
      urls: argv.au || metaInfo.general.url_designer,
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
      names: argv.fn,
      family: argv.ff || metaInfo.general.font_family
    },
    credits: argv.c,
    license: argv.l ? licenses[argv.l] : {
      version: "2.0",
      name: metaInfo.general.license_desc,
      url: metaInfo.general.url_license
    }
  }, done);
}


function processDirectory(sourcePath, targetPath, done) {
  var fontTargetPath = path.join(targetPath, 'fonts', 'default');
  prepareTargetDirectory(sourcePath, fontTargetPath, function(err) {
      if (err) return done(err);

      directory_metadata(fontTargetPath, function(err, metaInfo) {
        if (err) return done(err);

        generateReadme(targetPath, argv, metaInfo, function(err) {
          if (err) return done(err);

        });
      });
  });
}

processDirectory(sourcePath, targetPath, function(err) {
  checkError(err);
});

