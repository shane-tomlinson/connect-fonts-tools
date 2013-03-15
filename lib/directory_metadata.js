/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs')
      font_metadata = require('./font_metadata'),
      name_ids      = require('./name_ids');

const NAME_TABLE_FIELDS = [
  'copyright',
  'font_family',
  'trademark',
  'manufacturer',
  'designer',
  'description',
  'url_vendor',
  'url_designer',
  'license_desc',
  'url_license'
];

module.exports = function(directoryName, done) {
  fs.readdir(directoryName, function(err, files) {
    if (err) return done(err);

    getNameTables(directoryName, files, function(err, nameTables) {
      if (err) return done(err);

      getMetaInfo(nameTables, function(err, metaInfo) {
        done(err, metaInfo);
      });
    });
  });
};

function convertNameTable(nameTable) {
  var convertedTable = {};
  for (var key in nameTable) {
    convertedTable[keyOf(name_ids, parseInt(key, 10))] = nameTable[key];
  }

  return convertedTable;
}

function getNameTables(directoryName, files, done) {
  var nameTables = [];

  function processNextFile(done) {
    var fileName = files.shift();
    if (!fileName) return done();

    if (path.extname(fileName.toLowerCase()) === '.ttf') {
      var filePath = path.join(directoryName, fileName);
      font_metadata(filePath, function(err, info) {
        if (err) return done(err);

        console.log(info.tables);
        nameTables.push(convertNameTable(info.tables.name));
        processNextFile(done);
      });
    }
    else {
      console.warn(fileName + " is not a TTF file, skipping");
      processNextFile(done);
    }
  }

  processNextFile(function(err) {
    done(err, nameTables);
  });
}

function getMetaInfo(nameTables, done) {
  var metaInfo = nameTables.reduce(function(prevValue, currValue) {
    for (var key in currValue) {
      if (NAME_TABLE_FIELDS.indexOf(key) > -1) {
        if (!(key in prevValue)) {
          prevValue[key] = currValue[key];
        }
        else if (prevValue[key] !== currValue[key]) {
          console.warn("conflict in " + key + " '" + prevValue[key] + '" !== "' + currValue[key] + '"');
        }
      }
    }

    return prevValue;
  }, {});

  done(null, { general: metaInfo });
}

function keyOf(obj, value) {
  for (var key in obj) {
    if (obj[key] === value) return key;
  }
}

