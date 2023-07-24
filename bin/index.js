#! /usr/bin/env node
const fs = require('fs');
const path = require('path');
const fsUtils = require("./fs-utils.js")
const fsUtilsInstance = new fsUtils();

const VERSION = "1.1.0";

let debugMode = false;

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Please enter path to the build script as program's argument.")
    process.exit(1);
}

let file = args[0];

let argMap = {};
for (let arg of args.slice(1)) {
    if (debugMode) console.log("[DEBUG] Checking argument '" + arg + "'.");
    let equalsIndex = arg.indexOf("=");
    if (equalsIndex > 0) {
        let key = arg.substring(0, equalsIndex);
        let value = arg.substring(equalsIndex + 1);
        argMap[key] = value;
        if (debugMode) console.log("[DEBUG] Parameter '" + key + "' loaded from the arguments.");
    } else if (arg === "debug") {
        debugMode = true;
    }
}

const f = {
    input: (key, message, defaultValue) => {
        if (debugMode) console.log("[DEBUG] Function input was called with params: " + key + ", " + message + ", " + defaultValue);

        if (argMap[key] !== undefined) { // input value is in program arguments
            return argMap[key];
        } else { // need to get that input value
            let value;

            console.log(`<${key}> ${message}${defaultValue ? " [" + defaultValue + "]" : ""}: `);
            console.warn("Please provide parameter '" + key + "' in program arguments (in " + key + "=value syntax), the data-flow-builder can not read from the console yet.");

            // let value = readlineSync.question(`<${key}> ${message}${defaultValue ? " [" + defaultValue + "]" : ""}: `); // TODO it does not work with UTF-8

            if (!value && defaultValue !== undefined) {
                return defaultValue;
            }

            return value;
        }
    },
    copy: (source, target) => {
        if (debugMode) console.log("[DEBUG] Function copy was called with params: " + source + ", " + target);
        return fsUtilsInstance.copy(source, target);
    },
    createFile: (file, content, force) => {
        if (debugMode) console.log("[DEBUG] Function createFile was called with params: " + file + ", " + content);

        if (!fs.existsSync(path.resolve(file)) || force) {
            fs.writeFileSync(path.resolve(file), content);
            return true;
        } else {
            return false;
        }
    },
    replaceInFile: (file, searchValue, replaceValue) => {
        if (debugMode) console.log("[DEBUG] Function replace was called with params: " + file + ", " + searchValue + ", " + replaceValue);

        let text = fs.readFileSync(path.resolve(file), 'utf8');
        if (debugMode) console.log("[DEBUG] File " + file + " was loaded.");

        let count = 0;
        switch (typeof searchValue) {
            case "string":
                // single string
                if (debugMode) console.log("[DEBUG] Search value is a string.");
                let innerReplaceResult = _innerReplace(text, searchValue, replaceValue);
                count = innerReplaceResult.count;
                text = innerReplaceResult.text;
                break;
            case "object":
                if (searchValue instanceof RegExp) {
                    // single regexp value
                    if (debugMode) console.log("[DEBUG] Search value is a RegExp.");
                    let innerReplaceResult = _innerReplace(text, searchValue, replaceValue);
                    count = innerReplaceResult.count;
                    text = innerReplaceResult.text;
                    break;
                } else if (Array.isArray(searchValue)) {
                    // array of arrays value
                    if (debugMode) console.log("[DEBUG] Search value is an array.");
                    for (let replacePair of searchValue) {
                        if (Array.isArray(replacePair)) {
                            let innerReplaceResult = _innerReplace(text, replacePair[0], replacePair[1]);
                            count += innerReplaceResult.count;
                            text = innerReplaceResult.text;
                        } else {
                            console.warn("Element " + replacePair + " is not and array.");
                        }
                    }
                    break;
                } else {
                    // map value
                    if (debugMode) console.log("[DEBUG] Search value is a map (object).");
                    for (const key in searchValue) {
                        let innerReplaceResult = _innerReplace(text, key, searchValue[key]);
                        count += innerReplaceResult.count;
                        text = innerReplaceResult.text;
                    }
                    break;
                }
            default:
                console.error("Search value has unknown data type. Nothing was replaced.");
                return 0;
        }

        fs.writeFileSync(path.resolve(file), text);

        return count;

        function _innerReplace(text, searchValue, replaceValue) {
            if (typeof searchValue === "object" && searchValue instanceof RegExp) {
                if (debugMode) console.log("[DEBUG] Search value '" + searchValue + "' is a RegExp.");
                return _innerSingleReplace(text, searchValue, replaceValue);
            } else if (typeof searchValue === "string") {
                if (debugMode) console.log("[DEBUG] Search value '" + searchValue + "' is a string.");
                return _innerSingleReplace(text, searchValue, replaceValue);
            } else {
                console.error("Search value '" + searchValue + "' has unknown data type.");
                return 0;
            }
        }

        function _innerSingleReplace(text, searchValue, replaceValue) {
            let count = 0;
            if (replaceValue != null) {
                text = text.replace(searchValue, function () {
                    count += 1;
                    return replaceValue;
                })
            }
            return {count: count, text: text};
        }
    },
    assert: (expected, actual) => {
        console.log("assert called (" + expected + ", " + actual + ")");
    }
}

console.log("builder started");
if (debugMode) console.log('Current working directory: ' + process.cwd());

const buildScript = require(path.resolve(file));
buildScript(f, args, VERSION); // call build script

console.log("builder finished");

process.exit(0); //no errors occurred