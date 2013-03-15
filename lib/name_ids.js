/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A map of name id's => name table indexes
 */

// Info fetched from http://www.microsoft.com/typography/otspec/name.htm
const NAME_IDS = {
  copyright: 0,
  font_family: 1,
  font_subfamily: 2,
  font_id: 3,
  font_full_name: 4,
  version: 5,
  postscript_name: 6,
  trademark: 7,
  manufacturer: 8,
  designer: 9,
  description: 10,
  url_vendor: 11,
  url_designer: 12,
  license_desc: 13,
  url_license: 14
};

module.exports = NAME_IDS;

