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
  ls(directoryName, /\.ttf$/i, true, function(err, files) {
    if (err) return done(err);

    // convert file names to full paths
    files = files.map(function(fileName) {
      return path.join(directoryName, fileName);
    });

    getTables(files, function(err, tables) {
      if (err) return done(err);

      getCommonInfo(tables.name, function(err, commonInfo) {
        if (err) return done(err);

        getFontInfo(tables, function(err, fontInfo) {
          if (err) return done(err);

          done(null, { common: commonInfo, fonts: fontInfo });
        });
      });
    });
  });
};

/**
 * Get all files in a directory that match.
 */
function ls(target, matchRegExp, warn, done) {
  fs.readdir(target, function(err, files) {
    if (err) return done(err);

    var matches = [];
    files.forEach(function(fileName) {
      fileName = fileName.trim();
      if (matchRegExp.test(fileName)) {
        matches.push(fileName);
      } else if (warn) {
        console.warn(fileName + " does not match: " + matchRegExp);
      }
    });

    done(null, matches);
  });
};



function convertNameTable(nameTable) {
  var convertedTable = {};
  for (var key in nameTable) {
    convertedTable[keyOf(name_ids, parseInt(key, 10))] = nameTable[key];
  }

  return convertedTable;
}

function getTables(files, done) {
  var tables = {
    name: [],
    os2: [],
    post: [],
    file: []
  };

  function processNextFile() {
    var filePath = files.shift();
    if (!filePath) return done(null, tables);

    font_metadata(filePath, function(err, info) {
      if (err) return done(err);

      tables.name.push(convertNameTable(info.tables.name));
      tables.os2.push(info.tables['OS/2']);
      tables.post.push(info.tables.post);
      tables.file.push(info.tables.file);
      processNextFile();
    });
  }

  processNextFile();
}

function getCommonInfo(nameTables, done) {
  var commonInfo = nameTables.reduce(function(prevValue, currValue) {
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

  done(null, commonInfo);
}

function keyOf(obj, value) {
  for (var key in obj) {
    if (obj[key] === value) return key;
  }
}

function getFontInfo(tables, done) {
  var fontInfo = {};
  tables.file.forEach(function(fileInfo, index) {
    var nameTable = tables.name[index];
    var os2Table = tables.os2[index];
    var postTable = tables.post[index];
    var fileTable = tables.file[index];

    fontInfo[fileInfo.basename] = {
      weight: os2Table.weightClass,
      style: postTable.italicAngle !== 0 ? "italic" : "normal",
      local: nameTable.font_full_name,
      path: fileTable.path
    };
  });

  done(null, fontInfo);
}

