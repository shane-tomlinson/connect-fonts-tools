/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path        = require('path'),
      fs          = require('fs'),
      mkdirp      = require('mkdirp'),
      mustache    = require('mustache');

const TEMPLATES_PATH = path.join(__dirname, '.templates');
const README_TEMPLATE_PATH = path.join(TEMPLATES_PATH, 'README.md.mustache');

/**
 * Write README.md to a directory
 *
 * config:
 *  target_dir
 *  credits
 *  author.name
 *  author.email
 *  author.url
 *  author.github
 *  author.twitter
 *  font.name
 *  font.family
 *  license.version
 *  license.name
 *  license.url
 *  meta_info.subsets
 */
exports.write = function(iConfig, done) {
  // create a copy because the config is modified by split.
  var config = JSON.parse(JSON.stringify(iConfig));
  var err = null;
  try {
    var template = fs.readFileSync(README_TEMPLATE_PATH, 'utf8');
    split(config.author, "emails");
    split(config.author, "urls");
    split(config.author, "githubs");
    split(config.font, "names");
    var output = mustache.render(template, config);

    var targetPath = config.target_dir;
    mkdirp.sync(targetPath);

    var packagePath = path.join(targetPath,"README.md");
    fs.writeFileSync(packagePath, output, 'utf8');
  } catch(e) {
    err = e;
  }

  done && done(err);
};

function split(toSplit, field) {
  if (toSplit && toSplit[field]) {
    // only have "all_" if there is more than one font.
    if (toSplit[field].indexOf(',') > -1) {
      toSplit["all_" + field] = toSplit[field];
    }
    toSplit[field] = toSplit[field].split(',');
    toSplit["first_" + field] = toSplit[field][0];
  }
}
