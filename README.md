# node-sass-js-importer

[![Greenkeeper badge](https://badges.greenkeeper.io/Loilo/node-sass-js-importer.svg)](https://greenkeeper.io/)

JavaScript object literal importer for [node-sass](https://github.com/sass/node-sass). Allows `@import`ing CommonJS modules (`.js` files) in Sass files parsed by `node-sass`.

This is a fork of the [node-sass-json-importer](https://github.com/Updater/node-sass-json-importer) repository, adjusted for usage with JavaScript files.

[![npm](https://img.shields.io/npm/v/node-sass-js-importer.svg)](https://www.npmjs.com/package/node-sass-js-importer)
[![build status](https://travis-ci.org/Loilo/node-sass-js-importer.svg?branch=master)](https://travis-ci.org/Loilo/node-sass-js-importer)

## Usage
Note that this packages expects you to export JavaScript object literals from your imported files.

### [node-sass](https://github.com/sass/node-sass)
This module hooks into [node-sass's importer api](https://github.com/sass/node-sass#importer--v200---experimental).

```javascript
var sass = require('node-sass');
var jsImporter = require('node-sass-js-importer');

// Example 1
sass.render({
  file: scss_filename,
  importer: jsImporter,
  [, options..]
}, function(err, result) { /*...*/ });

// Example 2
var result = sass.renderSync({
  data: scss_content
  importer: [jsImporter, someOtherImporter]
  [, options..]
});
```

### [node-sass](https://github.com/sass/node-sass) command-line interface

To run this using node-sass CLI, point `--importer` to your installed JavaScript importer, for example: 

```sh
./node_modules/.bin/node-sass --importer node_modules/node-sass-js-importer/dist/node-sass-js-importer.js --recursive ./src --output ./dist
```

### Webpack / [sass-loader](https://github.com/jtangelder/sass-loader)

#### Webpack v1

```javascript
import jsImporter from 'node-sass-js-importer';

// Webpack config
export default {
  module: {
    loaders: [{
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    }],
  },
  // Apply the JavaScript importer via sass-loader's options.
  sassLoader: {
    importer: jsImporter
  }
};
```

#### Webpack v2

```javascript
import jsImporter from 'node-sass-js-importer';

// Webpack config
export default {
  module: {
    rules: [
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1
          },
        },
        {
          loader: 'sass-loader',
          // Apply the JavaScript importer via sass-loader's options.
          options: {
            importer: jsImporter,
          },
        },
      ],
    ],
  },
};
```

## Importing strings
Since JavaScript objects don't map directly to SASS's data types, a common source of confusion is how to handle strings. While [SASS allows strings to be both quoted and unqouted](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#sass-script-strings), strings containing spaces, commas and/or other special characters have to be wrapped in quotes. In terms of JavaScript, this means the string has to be double quoted:

##### Incorrect
```javascript
module.exports = {
  description: "A sentence with spaces."
}
```

##### Correct
```javascript
module.exports = {
  description: "'A sentence with spaces.'"
}
```

See discussion here for more:

https://github.com/Updater/node-sass-json-importer/pull/5

## Thanks to
This module is based on the [node-sass-json-importer](https://github.com/Updater/node-sass-json-importer) repository, they did all the work.
