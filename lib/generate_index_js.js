/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path        = require('path'),
      fs          = require('fs'),
      mkdirp      = require('mkdirp'),
      mustache    = require('mustache');

const TEMPLATES_PATH = path.join(__dirname, '.templates');
const LICENSE_TEMPLATE_PATH = path.join(TEMPLATES_PATH, 'index.js.mustache');

/**
 * Write index.js to a directory
 *
 * config:
 *  target_dir
 *  font.names
 *  font.family
 *  font.local
 */
exports.write = function(config) {
  var template = fs.readFileSync(LICENSE_TEMPLATE_PATH, 'utf8');

  var outputConfig = {
    fonts: [],
    aliases: []
  };

  var aliases = config.aliases;
  var lastAliasIndex = Object.keys(aliases).length - 1;
  var index = 0;
  for(var from in aliases) {
    outputConfig.aliases.push({ from: from, to: aliases[from], separator: index !== lastAliasIndex ? "," : ""});
    index++;
  }

  var fontNames = config.font.names;
  var lastFontIndex = fontNames.length - 1;
  var localNames = config.font.local;
  var fontFamily = config.font.family;

  if (fontNames.length !== localNames.length) {
    throw new Error("Number of local names must match number of font names");
  }

  fontNames.forEach(function(fontName, index) {
    fontName = fontName.trim();
    var local = localNames[index].trim();

    var fontConfig = {
      name: fontName,
      family: fontFamily,
      weight: getFontWeight(fontName),
      style: getFontStyle(fontName),
      local: [ '"' + local+ '"', '"' + local.replace(/\s+/g, '') + '"' ].join(', '),
      separator: index !== lastFontIndex ? "," : ""
    };

    outputConfig.fonts.push(fontConfig);
  });

  var output = mustache.render(template, outputConfig);
  console.log(output)

  var targetPath = config.target_dir;
  mkdirp.sync(targetPath);

  var outputPath = path.join(targetPath, "index.js");
  fs.writeFileSync(outputPath, output, 'utf8');
  var config = require(path.join(process.cwd(), outputPath));
};

/*
 * Info fetched from http://www.webtype.com/info/articles/fonts-weights/
 */
const NAME_TO_WEIGHT = {
  ultralight: 100,
  extralight: 100,
  light: 200,
  thin: 200,
  book: 300,
  demi: 300,
  normal: 400,
  regular: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  black: 800,
  extrabold: 800,
  heavy: 800,
  extrablack: 900,
  fat: 900,
  poster: 900,
  ultrablack: 900,
};

function getFontWeight(fontName) {
  for (var name in NAME_TO_WEIGHT) {
    var reg = new RegExp(name, 'gi');
    if (reg.test(fontName)) return NAME_TO_WEIGHT[name];
  }
  return 400;
}

function getFontStyle(fontName) {
  if (/italic/gi.test(fontName)) return "italic";
  return "normal";
}

