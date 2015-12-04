#! /usr/bin/env node

var css = require('css');
var argvs = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var DEFAULT_PREFIX = "icon";

if(argvs._.length == 0) {
  console.error("no css file");
  process.exit();
}

if(argvs._.length > 1) {
  console.error("more than one css file");
  process.exit();
}

var outputFile = argvs.o || argvs.output_file;

if(!outputFile) {
  console.error("out put file must be specified");
  process.exit();
}

outputFile = path.join(process.cwd(), outputFile);

var cssFile = path.join(process.cwd(), argvs._[0]);

var cssContent = fs.readFileSync(cssFile, "utf8");

var cssObj = css.parse(cssContent);

var rules = cssObj.stylesheet.rules;

var prefix = argvs.prefix || DEFAULT_PREFIX;

var result = {};

var prefixReg = new RegExp("^." + prefix + "-", 'i');

for(var i = 0; i < rules.length; i++) {
  var rule = rules[i];
  if(!rule.selectors) {
    continue;
  }
  if(rule.selectors.length > 1) {
    continue;
  }
  var selector = rule.selectors[0];
  if(!prefixReg.test(selector)) {
    continue;
  }
  var key = selector.replace(prefixReg, "");
  key = key.replace(/\:before$/g, "");

  if(rule.declarations.length > 1) {
    continue;
  }

  if(rule.declarations.length == 0) {
    continue;
  }

  var declaration = rule.declarations[0];
  if(declaration.property != "content") {
    continue;
  }

  var value = declaration.value;

  result[key] = value;
}


fs.writeFileSync(outputFile, JSON.stringify(result));

process.exit();
