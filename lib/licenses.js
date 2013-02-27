/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs');

const TEMPLATES_PATH = path.join(__dirname, '.templates', 'licenses');

module.exports = {
  "apache2.0": {
    name: "Apache",
    version: "2.0",
    abbreviation: "Apache-2.0",
    url: "http://www.apache.org/licenses/"
  },
  "mpl2.0": {
    name: "Mozilla Public License",
    version: "2.0",
    abbreviation: 'MPL-2.0',
    url: "http://mozilla.org/MPL/2.0/"
  },
  "ofl1.1": {
    name: "SIL Open Font License",
    version: "1.1",
    abbreviation: 'OFL-1.1',
    url: "http://scripts.sil.org/OFL"
  }
};

for (var key in module.exports) {
  var templatePath = path.join(TEMPLATES_PATH, key);
  module.exports[key].text = fs.readFileSync(templatePath, 'utf8');
}

