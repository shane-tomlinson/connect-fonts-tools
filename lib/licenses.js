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
  },
  "ufl1.0": {
    name: "Ubuntu Font License",
    version: "1.0",
    abbreviation: "UFL-1.0",
    url: "http://font.ubuntu.com/ufl/ubuntu-font-licence-1.0.txt"
  }
};

for (var key in exports.licenses) {
  var templatePath = path.join(TEMPLATES_PATH, key);
  exports.licenses[key].text = fs.readFileSync(templatePath, 'utf8');
}

exports.toIdentifier = function(description, copyright, url) {
  var license = getLicense(description)
                    || getLicense(copyright)
                    || getLicense(url);

  return license;
};

function getLicense(text) {
  var license;
  if (/SIL/g.test(text)
   || /sil.org/gi.test(text)
   || /Open Font License/gi.test(text)
   || /OFL/g.test(text)) {
      license = exports.licenses["ofl1.1"];
  } else if(/apache/gi.test(text)) {
      license = exports.licenses["apache2.0"];
  } else if(/mozilla/gi.test(text)) {
      license = exports.licenses["mpl2.0"];
  } else if(/ubuntu/gi.test(text)) {
      license = exports.licenses["ufl1.0"];
  }
  return license;
}

