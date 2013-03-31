/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Takes care of configuration management for generic connect-fonts config like
 * author name, author urls, etc.
 */

const path          = require('path'),
      fs            = require('fs'),
      mkdirp        = require('mkdirp'),
      prompt        = require('prompt');

const CONFIG_PATH   = path.join(getUserHome(), ".connect-fonts"),
      CONFIG_JSON_PATH
                    = path.join(CONFIG_PATH, "config.json");

const VALID_FIELDS = [
  'an',      // author name
  'ae',      // author emails
  'au',      // author urls
  'at',      // author twitter
  'ag',      // author github
];

prompt.message = ">".red;

exports.config_path = CONFIG_JSON_PATH;

/**
 * Write ~home/.connect-fonts/config.json for use in scripts like
 * create_repo_from_directory.
 */
exports.write = function(config, done) {
  mkdirp(CONFIG_PATH, function(err) {
    if (err) return done(err);

    var objToSave = filter(config, VALID_FIELDS);
    fs.writeFile(CONFIG_JSON_PATH, JSON.stringify(objToSave, null, 2) + "\n", 'utf8', done);
  });
};

exports.read = function(done) {
  fs.readFile(CONFIG_JSON_PATH, function(err, data) {
    if (err && err.code === "ENOENT") {
      // file does not exist
      data = "{}";
    }
    else if (err) return done(err);

    var err = null;
    try {
      data = JSON.parse(data);
    } catch(e) {
      err = e;
    }

    done(err, data);
  });
};

exports.ask = function(done) {
  exports.read(function(err, config) {
    if (err) return done(err);

    prompt.get([
      toPromptConfig("Author Name", "an", config),
      toPromptConfig("Author Emails (comma spearated list)", "ae", config),
      toPromptConfig("Author URLs (comma spearated list)", "au", config),
      toPromptConfig("Author Twitter", "at", config),
      toPromptConfig("Author GitHubs (comma separated list)", "ag", config),
    ], function(err, result) {
      if (err) return done(err);

      exports.write(result, done);
    });
  });
}

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

function filter(config, fields) {
  var filtered = {};
  fields.forEach(function(key) {
    filtered[key] = config[key];
  });
  return filtered;
}

function toPromptConfig(msg, key, config) {
  return {
    name: key,
    required: true,
    description: msg.green,
    default: config[key]
  };
}


