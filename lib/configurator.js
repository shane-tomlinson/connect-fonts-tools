/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EasierObject  = require('easierobject').easierObject,
      licenses      = require('./licenses');

module.exports = function(iArgv, iMetaInfo, done) {
  var config,
      err;

  try {
    var argv = new EasierObject(iArgv);
    var metaInfo = new EasierObject(iMetaInfo);

    var fontNames = metaInfo.getItem("fonts");
    if (fontNames) fontNames = Object.keys(fontNames).join(',');

    config = {
      meta_info: iMetaInfo,
      target_dir: argv.getItem('target_dir'),
      author: {
        name: argv.getItem('an') || metaInfo.getItem("common", "designer"),
        emails: argv.getItem('ae'),
        urls: argv.getItem('au') || metaInfo.getItem("common", "url_designer"),
        githubs: argv.getItem('ag'),
        twitter: argv.getItem('at')
      },
      package: {
        name: argv.getItem('pn'),
        homepage: argv.getItem('ph') || false,
        repourl: argv.getItem('pr') || false,
        bugsurl: argv.getItem('pb') || false,
        description: argv.getItem('description') || false
      },
      font: {
        names: argv.getItem('fn') || fontNames,
        description: metaInfo.getItem("common", "description"),
        family: argv.getItem('ff') || metaInfo.getItem("common", "font_family"),
        copyright: metaInfo.getItem("common", "copyright"),
        trademark: metaInfo.getItem("common", "trademark"),
        manufacturer: metaInfo.getItem("common", "manufacturer"),
        url_vendor: metaInfo.getItem("common", "url_vendor"),
        designer: metaInfo.getItem("common", "designer"),
        url_designer: metaInfo.getItem("common", "url_designer")
      },
      credits: argv.getItem('c'),
      license: argv.getItem('l') ? licenses.licenses[argv.getItem('l')] : metaInfo.getItem("common", "license")
    };
  } catch(e) {
    err = e;
  }

  done(err, !err && config);
};

