import isPlainObject from 'is-plain-object';
import { existsSync } from 'fs';
import path, { resolve, dirname } from 'path';

export default function(url, prev) {
  if (!isJSfile(url)) {
    return null;
  }

  let includePaths = this.options.includePaths ? this.options.includePaths.split(path.delimiter) : [];
  let paths = []
    .concat(dirname(prev))
    .concat(includePaths);

  let file = paths
    .map(path => resolve(path, url))
    .filter(existsSync)
    .pop();

  if (!file) {
    return new Error(`Unable to find "${url}" from the following path(s): ${paths.join(', ')}. Check includePaths.`);
  }

  // Prevent file from being cached by Node's `require` on continuous builds.
  // https://github.com/Updater/node-sass-json-importer/issues/21
  delete require.cache[require.resolve(file)];

  try {
    return {
      contents: transformJSONtoSass(require(file))
    };
  } catch(e) {
    return new Error(`node-sass-js-importer: Error transforming JavaScript to SASS. Check if you exported a valid JavaScript object. ${e}`);
  }

}

export function isJSfile(url) {
  return /\.js$/.test(url);
}

export function transformJSONtoSass(json) {
  return Object.keys(json)
    .map(key => `$${key}: ${parseValue(json[key])};`)
    .join('\n');
}

export function parseValue(value) {
  if (Array.isArray(value)) {
    return parseList(value);
  } else if (isPlainObject(value)) {
    return parseMap(value);
  } else {
    return value;
  }
}

export function parseList(list) {
  return `(${list
    .map(value => parseValue(value))
    .join(',')})`;
}

export function parseMap(map) {
  return `(${Object.keys(map)
    .map(key => `${key}: ${parseValue(map[key])}`)
    .join(',')})`;
}

// Super-hacky: Override Babel's transpiled export to provide both
// a default CommonJS export and named exports.
// Fixes: https://github.com/Updater/node-sass-json-importer/issues/32
// TODO: Remove in 3.0.0. Upgrade to Babel6.
module.exports = exports.default;
Object.keys(exports).forEach(key => module.exports[key] = exports[key]);
