#!/usr/bin/env node
// parse args
const args = process.argv.slice(2);
const [isDev] = args;

// construct entrypoint path
const path = require('path');
const entrypointPath = path.join(__dirname, '..', 'index.js');

// execute main function
const main = () => {
  // if dev arg is not passed - just start server normally
  if (isDev !== 'dev') {
    require(entrypointPath);
    return;
  }

  // if dev arg IS passed - run code via nodemon
  const nodemon = require('nodemon');

  // get current workdir
  const currentPath = process.cwd();

  // create default nodemon config
  let nodemonConfig = {
    script: entrypointPath,
    ignore: ['.git', 'node_modules'],
    ext: 'js',
  };
  // try to read local nodemon config if present
  const fs = require('fs');
  const localConfigPath = path.join(currentPath, 'nodemon.json');
  // if it is present - merge it with default config
  if (fs.existsSync(localConfigPath)) {
    nodemonConfig = {
      ...nodemonConfig,
      ...require(localConfigPath),
    };
  }

  // start nodemon
  nodemon(nodemonConfig);

  // report changes
  nodemon
    .on('start', function () {
      console.log('Graffiti app has started in development mode');
    })
    .on('quit', function () {
      process.exit();
    })
    .on('restart', function (files) {
      console.log('Graffiti app restarted due to changes in: ');
      files
        .map((file) => file.replace(currentPath, ''))
        .forEach((file) => console.log(`  > ${file}`));
    });
};

// invoke main function
main();
