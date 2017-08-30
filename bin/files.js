'use strict';
const fs        = require('fs');
const path      = require('path');

module.exports = {
    exists,
    readFile,
    readDir,
    stat
};

function exists(filePath) {
    return stat(filePath)
        .then(() => true)
        .catch(err => {
            if (err.code === 'ENOENT') return false;
            throw err;
        });
}

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    });
}

function readDir(dirPath, options) {
    if (!options) options = {};
    if (!options.hasOwnProperty('recursive')) options.recursive = () => true;
    if (!options.hasOwnProperty('filter')) options.filter = () => true;

    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, function(err, files) {
            if (err) return reject(err);
            const fullPaths = files.map(f => path.resolve(dirPath, f));
            const results = [];
            const promises = [];

            fullPaths.forEach(fullPath => {
                const promise = stat(fullPath)
                    .then(stats => {
                        if (options.filter(fullPath, stats)) results.push(fullPath);
                        if (options.recursive && options.recursive(fullPath) && stats.isDirectory()) {
                            return readDir(fullPath, options)
                                .then(matches => results.push.apply(results, matches))
                                .catch(reject);
                        }
                    });
                promises.push(promise);
            });

            Promise.all(promises).then(() => resolve(results)).catch(reject);
        });
    });
}

function stat(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, function(err, stats) {
            if (err) return reject(err);
            resolve(stats);
        });
    });
}
