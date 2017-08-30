'use strict';
const archiver      = require('archiver');
const decompress    = require('decompress');
const files         = require('./files');
const path          = require('path');

/**
 * Recursively search up the directory tree to find the package.json file.
 * @param {string} dirPath
 * @returns {Promise.<{ path: string, dir: string, data: object }>}
 */
exports.getPackageDescription = async function(dirPath) {
    let filePath;
    let prevDir = null;
    while (prevDir !== dirPath) {
        filePath = path.resolve(dirPath, 'package.json');
        prevDir = dirPath;
        try {
            const content = await files.readFile(filePath);
            return {
                path: filePath,
                dir: dirPath,
                data: JSON.parse(content)
            };
        } catch (err) {
            if (err.code === 'ENOENT') {
                dirPath = path.dirname(dirPath);
            } else {
                throw err;
            }
        }
    }
};

exports.unzip = function(stream, destination) {
    return decompress(stream, destination);
};

/**
 * Convert a directory into a zip file.
 * @param {string} dirPath The directory to zip up.
 * @param {boolean} [testFiles] Whether to include test files in the zip.
 * @returns {Readable} A readable stream that has promise .then and .catch
 */
exports.zip = function(dirPath, testFiles) {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    const rxFilter = testFiles
        ? /(?:^|[\/\\])(?:\..|private)|node_modules|(?:\.zip$)/
        : /(?:(?:^|[\/\\])(?:\..|private)|node_modules|(?:\.zip$))|(^test[\/\\])/;

    // create zip from files
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // add promise like then
    archive.then = function(onSuccess, onReject) {
        deferred.promise.then(onSuccess, onReject);
    };

    // add promise like catch
    archive.catch = function(onReject) {
        deferred.promise.then(onReject);
    };

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.warn(err.message);
        } else {
            deferred.reject(err);
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        deferred.reject(err);
    });

    archive.on('close', () => {
        deferred.resolve();
    });

    // get only file path for files that don't reside within node modules and that are not private
    const rxRecursive = /node_modules/;
    const filter = (filePath, stats) => !rxFilter.test(filePath) && stats.isFile();
    const recursive = filePath => {
        const relPath = path.relative(dirPath, filePath);
        return !rxRecursive.test(relPath);
    };

    files.readDir(dirPath, { filter, recursive })
        .then(paths => {

            paths.forEach(fullPath => {
                const relative = path.relative(dirPath, fullPath);
                archive.file(fullPath, { name: relative });
            });

            // finalize the archive (ie we are done appending files but streams have to finish yet)
            archive.finalize();
        });

    return archive;
};