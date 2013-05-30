/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.splitField = function(toSplit, field) {
  if (toSplit && toSplit[field]) {
    // only have "all_" if there is more than one font.
    if (toSplit[field].indexOf(',') > -1) {
      toSplit["all_" + field] = toSplit[field];
    }
    toSplit[field] = toSplit[field].split(',');
    toSplit["first_" + field] = toSplit[field][0];
  }
}

exports.deepCopy = function(toCopy) {
  return JSON.parse(JSON.stringify(toCopy));
}

