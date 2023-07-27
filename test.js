const execSync = require('child_process').execSync;

execSync(`npm exec data-flow-builder build-script-example.js variable="{"key": value}"`, {stdio: "inherit"});