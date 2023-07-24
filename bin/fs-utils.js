const fs = require("fs");
const path = require('path');

class FsUtils {
    /**
     * Copies file/directory recursively from source to destination
     * @param {string} source path to source folder/destination
     * @param {string} target path to destination folder
     */
    copy(source, target){
        if(fs.lstatSync(source).isDirectory()){
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
        let targetFolder = path.join(target, path.basename(source));
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder);
        }

        // Copy
        if (fs.lstatSync(source).isDirectory()) {
            files = fs.readdirSync(source);
            files.forEach((file) => {
                let curSource = path.join(source, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    this.copyFolderRecursiveSync(curSource, targetFolder);
                } else {
                    this.copyFileSync(curSource, targetFolder);
                }
            });
        }
    }
}

module.exports = FsUtils;
