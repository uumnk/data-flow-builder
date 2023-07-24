const fs = require("fs");
const path = require('path');

class FsUtils {
    /**
     * Copies file/directory recursively from source to destination
     * @param {string} source path to source folder/destination
     * @param {string} target path to destination folder
     */
    copy(source, target) {
        if (fs.lstatSync(source).isDirectory()) {
            this.copyFolderRecursiveSync(source, target);
        } else {
            this.copyFileSync(source, target);
        }
    }

    copyFileSync(source, target) {
        let targetFile = target;

        // If target is a directory, a new file with the same name will be created
        if (fs.existsSync(target)) {
            if (fs.lstatSync(target).isDirectory()) {
                targetFile = path.join(target, path.basename(source));
            }
        }

        fs.copyFileSync(source, targetFile);
    }

    copyFolderRecursiveSync(source, target) {
        let files = [];

        // Check if folder needs to be created or integrated
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target);
        }

        // Copy
        if (fs.lstatSync(source).isDirectory()) {
            files = fs.readdirSync(source);
            files.forEach((file) => {
                let curSource = path.join(source, file);
                let curTarget = path.join(target, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    this.copyFolderRecursiveSync(curSource, curTarget);
                } else {
                    this.copyFileSync(curSource, curTarget);
                }
            });
        }
    }
}

module.exports = FsUtils;
