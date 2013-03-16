/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path        = require('path'),
      fs          = require('fs'),
      mkdirp      = require('mkdirp'),
      mustache    = require('mustache');

const TEMPLATES_PATH = path.join(__dirname, '.templates');
const LICENSE_TEMPLATE_PATH = path.join(TEMPLATES_PATH, 'LICENSE.mustache');

/**
 * Write LICENSE to a directory
 *
 * config:
 *  target_dir
 *  license.version
 *  license.name
 *  license.url
 *  license.text
 *  license.custom
 *  font.copyright
 */
exports.write = function(config, done) {
  var err;
  try {
    var template = fs.readFileSync(LICENSE_TEMPLATE_PATH, 'utf8');
    var output = mustache.render(template, config);

    var targetPath = config.target_dir;
    mkdirp.sync(targetPath);

    var packagePath = path.join(targetPath,"LICENSE");
    fs.writeFileSync(packagePath, output, 'utf8');
  } catch(e) {
    err = e;
  }

  done(err);
};

