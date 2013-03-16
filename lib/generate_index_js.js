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
exports.write = function(config, done) {
  var outputConfig = getOutputConfig(config);
  saveIndex(config.target_dir, outputConfig, done);
};

function saveIndex(targetPath, outputConfig, done) {
  var err;
  try {
    var template = fs.readFileSync(LICENSE_TEMPLATE_PATH, 'utf8');
    var output = mustache.render(template, outputConfig);
    console.log(output)

    mkdirp.sync(targetPath);

    var outputPath = path.join(targetPath, "index.js");
    fs.writeFileSync(outputPath, output, 'utf8');
    var config = require(outputPath);
  } catch(e) {
    err = e;
  }

  done(err);
}

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

function getAliases(config) {
  var aliases = config.aliases;
  var outputAliases = [];
  var lastAliasIndex = Object.keys(aliases).length - 1;
  var index = 0;
  for(var from in aliases) {
    outputAliases.push({ from: from, to: aliases[from], separator: index !== lastAliasIndex ? "," : ""});
    index++;
  }

  return outputAliases;
}

function getFontConfigFromTtfInfo(config) {
  var outputFonts = [];

  var lastFontIndex = Object.keys(config.fonts).length - 1;
  var index = 0;
  for (var key in config.fonts) {
    var font = config.fonts[key];
    var fontConfig = {
      name: key,
      family: config.common.font_family,
      weight: font.weight,
      style: font.style,
      local: [ '"' + font.local+ '"', '"' + font.local.replace(/\s+/g, '') + '"' ].join(', '),
      separator: index !== lastFontIndex ? "," : ""
    };
    outputFonts.push(fontConfig);
    index++;
  }

  return outputFonts;
}

function getFontConfigFromFontname(config) {
  var fontNames = config.font.names;
  var lastFontIndex = fontNames.length - 1;
  var localNames = config.font.local;
  var fontFamily = config.font.family;

  if (fontNames.length !== localNames.length) {
    throw new Error("Number of local names must match number of font names");
  }

  var outputFonts = [];
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

    outputFonts.push(fontConfig);
  });

  return outputFonts;
}

function getOutputConfig(config) {
  var outputConfig = {
    fonts: config.common ? getFontConfigFromTtfInfo(config) : getFontConfigFromFontname(config),
    aliases: getAliases(config)
  };

  return outputConfig;
}

