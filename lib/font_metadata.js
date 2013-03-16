/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      font          = require('font'),
      ttfinfo       = require('ttfinfo');

module.exports = function(fontPath, done) {
  try {
    ttfinfo(fontPath, function(err, info) {
      if (err) return done(err);

      info.tables.file = {
        path: fontPath,
        basename: path.basename(fontPath, '.ttf')
      };

      done(null, info);
    });
  } catch(e) {
    done(e);
  }
};



function getWeight(fontData) {
  return getTable(fontData, "OS/2").weightClass;
}

function getStyle(fontData) {
  var italicAngle = getTable(fontData, "post").italicAngle;
  return italicAngle ? "italic" : "normal";
}

function getNameData(fontData, field) {
  var item = getNameRecord(fontData, field);
  return item;
}

function getNameRecord(fontData, nameID) {
  var nameTable = getTable(fontData, "name");
  return nameTable[nameID];
}

function getTable(fontData, name) {
  for (var i = 0, table; table = fontData.tables[i]; ++i) {
    if (table.tag === name) return table.contents;
  }
}


