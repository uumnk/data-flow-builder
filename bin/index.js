#! /usr/bin/env node
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Hello npx world!")
} else {
    let result = args.join(" ");
    console.log("Hello " + result + "!");
}

process.exit(0); //no errors occurred