/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs'),
      rimraf        = require('rimraf'),
      mkdirp        = require('mkdirp'),
      ncp           = require('ncp').ncp,
      url           = require('url'),
      http          = require('http'),
      https         = require('https'),
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
  prepareTarget(sourcePath, fontTargetPath, function(err) {
    if (err) return done(err);

    directory_metadata(fontTargetPath, function(err, metaInfo) {
      if (err) return done(err);

      ensureRegularFontIfNeeded(metaInfo, function(err) {
        if (err) return done(err);

        generateReadme(targetPath, argv, metaInfo, function(err) {
          if (err) return done(err);

          generateIndex(targetPath, metaInfo, function(err) {
            if (err) return done(err);

            generateLicense(targetPath, metaInfo, function(err) {
              if (err) return done(err);

              generatePackageJson(targetPath, argv, metaInfo, function(err) {
                if (err) return done(err);

                generateWebFontsFromTtf(metaInfo, function(err) {
                  if (err) return done(err);
                  done(null);
                });
              });
            });
          });
        });
      });
    });
  });
};

function ensureRegularFontIfNeeded(metaInfo, done) {
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

          done(null);
        });
      } else {
        console.error("could not find regular font, continuing anyways")
      }
    }
  }
  done(null);
}

/*
 * Copy source path to target path. Create target if needed.
 * Normalize all filenames in target. Leaves original directory untouched.
 */
function prepareTarget(sourcePath, targetPath, done) {
  rimraf(targetPath, function(err) {
    mkdirp(targetPath, function(err) {
      if (err) return done(err);

      ncp(sourcePath, targetPath, function(err) {
        if (err) return done(err);

        normalize_filenames(targetPath, false, done);
      });
    });
  });
}


function generateReadme(targetPath, argv, metaInfo, done) {
  console.log(metaInfo);
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
    license: argv.l ? licenses[argv.l] : {
      version: "2.0",
      name: metaInfo.common.license_desc,
      url: metaInfo.common.url_license
    }
  }, done);
}

function generateIndex(targetPath, metaInfo, done) {
  metaInfo.aliases = {};
  metaInfo.target_dir = targetPath;

  gen_index.write(metaInfo, done);
}

function generateLicense(targetPath, metaInfo, done) {
  getLicenseText(metaInfo.common.url_license, function(err, license) {
    if (err) return done(err);

    gen_license.write({
      target_dir: targetPath,
      license: {
        url: metaInfo.common.url_license,
        custom: metaInfo.common.license_desc,
        text: license
      },
      font: {
        copyright: metaInfo.common.copyright,
        trademark: metaInfo.common.trademark
      }
    }, done);
  });
}

function getLicenseText(licenseUrl, done) {
  var protocol = url.parse(licenseUrl).protocol === "https://" ? https : http;
  protocol.get(licenseUrl, function(res) {
    var data = "";
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      done(null, data);
    });
  }).on('error', function(e) {
    done(e);
  }).setTimeout(3000, function() {
    done(new Error("timeout on " + licenseUrl));
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
    license: {
      abbreviation: metaInfo.common.license_desc,
      url: metaInfo.common.url_license
    },
    author: {
      name: argv.an || metaInfo.common.designer,
      emails: argv.ae,
      urls: argv.au || metaInfo.common.url_designer,
      githubs: argv.ag,
      twitter: argv.at
    }
  }, done);
}

function generateWebFontsFromTtf(metaInfo, done) {
  var fontPaths = Object.keys(metaInfo.fonts).map(function(fontName) {
    return metaInfo.fonts[fontName].path;
  });

  processNext();

  function processNext() {
    var fontPath = fontPaths.shift();
    if (!fontPath) return done(null);

    gen_fonts_from_ttf.write(fontPath, path.dirname(fontPath), function(err) {
      if (err) return done(err);
      processNext();
    });
  }
}

