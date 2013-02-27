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
 */
exports.write = function(config) {
  var template = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  var output = mustache.render(template, config);

  var package = JSON.parse(output);
  console.log(output);
  var targetPath = config.target_dir;
  mkdirp.sync(targetPath);

  var packagePath = path.join(targetPath,"package.json");
  fs.writeFileSync(packagePath, output, 'utf8');
};
