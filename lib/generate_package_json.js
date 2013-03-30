/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path        = require('path'),
      fs          = require('fs'),
      mkdirp      = require('mkdirp'),
      mustache    = require('mustache');

const TEMPLATES_PATH = path.join(__dirname, '.templates');
const PACKAGE_JSON_PATH = path.join(TEMPLATES_PATH, 'package.json.mustache');

/**
 * Write package.json to a directory
 *
 * config:
 *  target_dir
 *  author.name
 *  author.email
 *  author.url
 *  package.name
 *  package.description
 *  package.homepage
 *  package.repourl
 *  package.bugsurl
 *  license.abbreviation
 *  license.url
 *  font.family
 *  font.names
 */
exports.write = function(iConfig, done) {
  // create a copy because the config is modified by split.
  var config = JSON.parse(JSON.stringify(iConfig));
  var err;
  try {
    var template = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    split(config.font, "names");
    split(config.author, "emails");
    split(config.author, "urls");
    var output = mustache.render(template, config);

    var package = JSON.parse(output);
    var targetPath = config.target_dir;
    mkdirp.sync(targetPath);

    var packagePath = path.join(targetPath,"package.json");
    fs.writeFileSync(packagePath, output, 'utf8');
  } catch(e) {
    err = e;
  }
  done && done(err);
};

function split(toSplit, field) {
  console.log("splitting", field, typeof toSplit[field], toSplit[field]);

  if (toSplit[field]) {
    toSplit[field] = toSplit[field].split(',');
    toSplit["first_" + field] = toSplit[field][0];
  }
}

