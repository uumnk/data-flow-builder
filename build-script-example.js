const TEST_FILE = "./testFile.txt";
const TEST_FILE_COPY = "./testFileCopy.txt";

module.exports = (f, args, version) => {
    if (version !== "1.1.6") {
        console.warn("Different version of data flow builder is used. Double-check the results!");
    }

    console.log("Hello world from build script!");

    // manual input:
    const manualInput = f.input("manual", "Enter some value manually", "some default value");
    console.log("Manually entered value was: " + manualInput);

    // input example
    let value = f.input("variable", "Enter the value", "default value");
    console.log("The given value is: " + value);

    // create file example
    f.createFile(TEST_FILE, "data-flow-builder 1", true);

    // copy example
    f.copy(TEST_FILE, TEST_FILE_COPY);

    // replace example
    let count;
    count = f.replaceInFile(TEST_FILE, "data-flow-builder 1", "data-flow-builder 2"); // TODO avoid infinite loop (maybe only one replacement by default?)
    console.log("Replaced " + count + " strings.");
    count = f.replaceInFile(TEST_FILE, {"data-flow-builder 2": "data-flow-builder 3"});
    console.log("Replaced " + count + " strings.");
    count = f.replaceInFile(TEST_FILE, [["data-flow-builder 3", "data-flow-builder 4"], ["data-flow-builder 4", "data-flow-builder 5"]]);
    console.log("Replaced " + count + " strings.");
    count = f.replaceInFile(TEST_FILE, /data-flow-builder 5/, "data-flow-builder 6");
    console.log("Replaced " + count + " strings.");
    count = f.replaceInFile(TEST_FILE, [[/data-flow-builder 6/g, "data-flow-builder 7"], [/data-flow-builder 7/, "data-flow-builder 8"]]);
    console.log("Replaced " + count + " strings.");

    count = f.replaceInFile(TEST_FILE, [
        [/data-flow-(builder) 8/g, "data-flow-$1 9"],
        [/data-flow-builder 9/, "$& 3/4"],
        [/9 3\/4/, "$`10"],
        [/data-flow-builder /, "$'11 > "],
        [/1011/, "$`$$$&"],
        [/(data)-(flow)-(builder)/g, "$1$2$3"],
        [/(?<name>dataflowbuilder)/g, "awesome$<name>!"],
        ["awesomedataflowbuilder! awesomedataflowbuilder! $1011 > awesomedataflowbuilder! 10", "data-flow-builder 12"]
    ]);
    console.log("Replaced " + count + " strings.");

    count = f.replaceInFile(TEST_FILE, {"data-flow": "test ", "-builder 12": "was successful"});
    console.log("Replaced " + count + " strings.");

    // assert example
    f.assert(1 === 1);
    console.log("End of the build script.");
};