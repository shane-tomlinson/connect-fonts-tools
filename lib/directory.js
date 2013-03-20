/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs'),
      rimraf        = require('rimraf'),
      mkdirp        = require('mkdirp'),
      ncp           = require('ncp').ncp,
      url           = require('url'),
      async         = require('async'),
      gen_readme    = require('./generate_readme'),
      gen_index     = require('./generate_index_js'),
      gen_license   = require('./generate_license'),
      gen_package_json
                    = require('./generate_package_json'),
      gen_fonts_from_ttf
                    = require('./generate_fonts_from_ttf'),
      licenses      = require('./licenses'),
      directory_metadata
                    = require('./directory_metadata'),
      normalize_filenames
                    = require('./normalize_filenames');

/*
 * Process a directory.
 */
exports.process = function(sourcePath, targetPath, argv, done) {
  var fontTargetPath = path.join(targetPath, 'fonts', 'default');
  async.waterfall([
    // prepareTarget takes sourcePath and fontTargetPath
    async.apply(prepareTarget, sourcePath, fontTargetPath),
    directory_metadata,
    // the rest take targetPath, argv, and metaInfo. metaInfo is passed in as
    // the result from directory_metadata.
    async.apply(ensureRegularFontIfNeeded, targetPath, argv),
    generateReadme,
    generateIndex,
    generateLicense,
    generatePackageJson,
    generateWebFontsFromTtf
  ], done);
};

/*
 * Copy source path to target path. Create target if needed.
 * Normalize all filenames in target. Leaves original directory untouched.
 */
function prepareTarget(sourcePath, targetPath, done) {
  rimraf(targetPath, function(err) {
    mkdirp(targetPath, function(err) {
      if (err) return done(err);

      function filter(name) {
        var copy = (name === sourcePath || /\.ttf$/.test(name));
        if (!copy) { console.warn(path.basename(name) + ' is not a .ttf, skipping'); }
        return copy;
      }

      ncp(sourcePath, targetPath, {filter: filter}, function(err) {
        if (err) return done(err);

        normalize_filenames(targetPath, false, function(err) {
          if (err) return done(err);
          done(null, targetPath);
        });
      });
    });
  });
}



function ensureRegularFontIfNeeded(targetPath, argv, metaInfo, done) {
  var fonts = Object.keys(metaInfo.fonts);

  // If there is only one font, nobody cares.
  if (fonts.length > 1) {
    var regularFont = fonts.reduce(function(foundRegularFont, fontName) {
      if (/-regular/.test(fontName)) return fontName;
      return foundRegularFont;
    }, null);

    if (!regularFont) {
      // no font passes the regular test, go find the most likely candidate
      // from the list of configs.
      regularFont = fonts.reduce(function(foundRegularFontConfig, fontName) {
        if (foundRegularFontConfig) return foundRegularFontConfig;

        var fontConfig = metaInfo.fonts[fontName];
        if (fontConfig.style === 'normal' &&
                [400, 500].indexOf(fontConfig.weight) > -1) {
          return fontName;
        }
      }, null);

      if (regularFont) {
        // found a candidate font, now rename the file and update the
        // configuration object.
        var fontConfig = metaInfo.fonts[regularFont];
        var newFontName = regularFont + '-regular';
        var newPath = path.join(path.dirname(fontConfig.path), newFontName + '.ttf');

        console.log("renaming", path.basename(fontConfig.path), "to", path.basename(newPath));

        fs.rename(fontConfig.path, newPath, function(err) {
          if (err) return done(err);

          fontConfig.path = newPath;

          delete metaInfo.fonts[regularFont];
          metaInfo.fonts[newFontName] = fontConfig;

          done(null, targetPath, argv, metaInfo);
        });
      } else {
        console.error("could not find regular font, continuing anyways")
      }
    }
  }
  done(null, targetPath, argv, metaInfo);
}

function generateReadme(targetPath, argv, metaInfo, done) {
  gen_readme.write({
    target_dir: targetPath,
    author: {
      name: argv.an || metaInfo.common.designer,
      emails: argv.ae,
      urls: argv.au || metaInfo.common.url_designer,
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
      names: argv.fn || Object.keys(metaInfo.fonts).join(','),
      description: metaInfo.common.description,
      family: argv.ff || metaInfo.common.font_family,
      copyright: metaInfo.common.copyright,
      trademark: metaInfo.common.trademark,
      manufacturer: metaInfo.common.manufacturer,
      url_vendor: metaInfo.common.url_vendor,
      designer: metaInfo.common.designer,
      url_designer: metaInfo.common.url_designer
    },
    credits: argv.c,
    license: argv.l ? licenses.licenses[argv.l] : metaInfo.common.license
  }, function(err) {
    if (err) return done(err);
    done(null, targetPath, argv, metaInfo);
  });
}

function generateIndex(targetPath, argv, metaInfo, done) {
  metaInfo.aliases = {};
  metaInfo.target_dir = targetPath;

  gen_index.write(metaInfo, function(err) {
    if (err) return done(err);
    done(null, targetPath, argv, metaInfo);
  });
}

function generateLicense(targetPath, argv, metaInfo, done) {
  gen_license.write({
    target_dir: targetPath,
    license: argv.l ? licenses.licenses[argv.l] : metaInfo.common.license,
    font: {
      copyright: metaInfo.common.copyright,
      trademark: metaInfo.common.trademark
    }
  }, function(err) {
    if (err) return done(err);
    done(null, targetPath, argv, metaInfo);
  });
}

function generatePackageJson(targetPath, argv, metaInfo, done) {
  gen_package_json.write({
    target_dir: targetPath,
    package: {
      name: argv.pn,
      homepage: argv.ph || false,
      repourl: argv.pr || false,
      bugsurl: argv.pb || false,
      description: argv.description || false
    },
    font: {
      names: argv.fn || Object.keys(metaInfo.fonts).join(','),
      family: argv.ff || metaInfo.common.font_family
    },
    license: argv.l ? licenses.licenses[argv.l] : metaInfo.common.license,
    author: {
      name: argv.an || metaInfo.common.designer,
      emails: argv.ae,
      urls: argv.au || metaInfo.common.url_designer,
      githubs: argv.ag,
      twitter: argv.at
    }
  }, function(err) {
    if (err) return done(err);
    done(null, targetPath, argv, metaInfo);
  });
}

function generateWebFontsFromTtf(targetPath, argv, metaInfo, done) {
  var fontPaths = Object.keys(metaInfo.fonts).map(function(fontName) {
    return metaInfo.fonts[fontName].path;
  });

  processNext();

  function processNext() {
    var fontPath = fontPaths.shift();
    if (!fontPath) return done(null, targetPath, argv, metaInfo);

    gen_fonts_from_ttf.write(fontPath, path.dirname(fontPath), function(err) {
      if (err) return done(err);
      processNext();
    });
  }
}

