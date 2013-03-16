/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs');

const TEMPLATES_PATH = path.join(__dirname, '.templates', 'licenses');

exports.licenses = {
  "apache2.0": {
    name: "Apache",
    version: "2.0",
    abbreviation: "Apache-2.0",
    url: "http://www.apache.org/licenses/LICENSE-2.0"
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

for (var key in exports.licenses) {
  var templatePath = path.join(TEMPLATES_PATH, key);
  exports.licenses[key].text = fs.readFileSync(templatePath, 'utf8');
}

exports.toIdentifier = function(description, url) {
  var license;

  if (/SIL/g.test(description)
   || /Open Font License/gi.test(description)
   || /OFL/g.test(description)
   || /sil.org/gi.test(url)
   || /OFL/g.test(url)) {
      license = exports.licenses["ofl1.1"];
  } else if(/apache/gi.test(description)
         || /apache/gi.test(url)) {
      license = exports.licenses["apache2.0"];
  } else if(/mozilla/gi.test(description)
         || /mozill/gi.test(url)) {
      license = exports.licenses["mpl2.0"];
  }

  return license;
};
