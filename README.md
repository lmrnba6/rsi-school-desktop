# Sample application using Angular 6+, Electron 2+, SQLite3 4+, Bootstrap 4+ and Webpack 4+

It took me quite some time to figure out how to use SQLite database in an Electron application. Because of the difficulties I've encountered, I've been using sql.js and Lovefield as alternatives.

 - [sql.js](https://github.com/kripken/sql.js/) is SQLite compiled to javascript and therefore easy to integrated.<br />
   The disadvantage is that it loads the entire database in memory at startup and needs to be written back to disk when the app finishes.
 - [lovefield](https://www.npmjs.com/package/lovefield) is also build in Javascript, but stores the data in the browser's IndexedDb. It does not use SQL, but its own api.<br />
   My main issues with lovefield are that I needed more complex sql statements and needed to be able to store the database anywhere on disk.

None of the above was satisfactory, so I continued the search to bundle SQLite and finally found a way to access SQLite from Electron/node and overcome bundling issues with webpack.

This repository is a stripped down Electron application using Angular 5, SQLite, Bootstrap 4 and WebPack.

> **Note**
> Since I develop solely on Windows 10, I have not tested the application on any unix version.

## Prerequisites (Windows 10)
Both Visual C++ Build Tools and Python 2.7 are required for [node-gyp](https://github.com/nodejs/node-gyp) to rebuild native SQLite library for node.<br />
For installation instructions see [node-gyp](https://github.com/nodejs/node-gyp).

## Quickstart
npm install --global --production windows-build-tools
npm install -g node-gyp
npm install -g pg-native
 1. git clone https://github.com/rsi-technologies/angular5-electron-sqlite3-bootstrap4-webpack.git
 1. npm install
 1. npm run build:once
 1. npm start
    - Enter new database name in file dialog.

## Karma tests
 - npm run test

## Building installable exe
 - npm run package

## Notes
- Application can switch between a fixed database location or allow the end-user to select a location at first startup.<br />
  See src/app/model/Settings.hasFixedDbLocation
- While developing, `settings.json` (points to database location) is located in `c:/users/yourname/AppData/Roaming/$productName}-dev`<br />
When running packaged executable, `settings.json` is located in `c:/users/yourname/AppData/Roaming/$productName}`. This way development will not override production data.
- TheDb provides a Promise-ified wrapper around bare sqlite3 API.
