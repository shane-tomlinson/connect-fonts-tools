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



