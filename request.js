'use strict';
const archiver      = require('archiver');
const decompress    = require('decompress');
const fs            = require('fs');
const path          = require('path');
const Request       = require('request');
const tempDir       = require('os').tmpdir();

const appDataPath = path.resolve(tempDir, 'it410.dat');
const cookiePath = path.resolve(tempDir, 'it410.cookie');
const defaultHost = 'http://james.darktech.org';
const zipPath = path.resolve(tempDir, 'it410.zip');

const app = appData();
const host = (app || defaultHost).replace(/\/$/, '') + '/';
const baseUrl = host + 'api';

exports.appData = function() {
    const input = process.argv[3];
    if (input) {
        appData(input);
        console.log('Host changed from ' + host + ' to ' + input);
    } else {
        appData(defaultHost);
        console.log('Host changed to default host: ' + defaultHost);
    }
};

exports.authenticate = function() {
    if (!process.argv[3]) return Promise.reject(Error('Missing required authentication id: token'));

    const sid = process.argv[3];
    const options = {
        baseUrl: host,
        uri: '/auth/about',
        headers: {
            Cookie: 'connect.sid=' + sid
        },
        json: true
    };
    return request(options)
        .then(res => {
            switch (res.statusCode) {
                case 200:
                    setCookie(res.body, sid);
                    console.log('Authentication successful');
                    break;

                default:
                    console.log('Authentication failed: ' + res.body);
                    break;
            }
        });
};

exports.cookie = getCookie();

exports.exit = function() {
    const cookie = getCookie();
    if (cookie) {
        setCookie(null);
        console.log('Good bye, ' + cookie.displayName);
    } else {
        console.log('Already logged out');
    }
};

exports.get = function() {
    if (!process.argv[3]) return Promise.reject(Error('Missing required command attribute: project'));

    const project = process.argv[3];
    const dest = path.resolve(process.cwd(), process.argv[4] || '');

    const options = {
        baseUrl: baseUrl,
        headers: { 'user-agent': 'grader-client' },
        uri: '/projects/' + project + '/download'
    };
    let statusCode;
    return new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(zipPath);

        // wait for zip file to finish write before decompress
        ws.on('close', () => {
            if (statusCode === 200) {
                const out = path.resolve(dest, project);
                decompress(zipPath, out)
                    .then(files => {
                        fs.unlink(zipPath, () => {});
                        console.log(`Downloaded ${ files.length } files to ${ out }`);
                    })
                    .then(resolve, reject);
            }
        });

        Request(options)
            .on('response', res => {
                statusCode = res.statusCode;
                switch (statusCode) {
                    case 404:
                        console.log('Project not found: ' + project);
                        break;
                }
                if (statusCode !== 200) reject(Error('Unable to download project'));
            })
            .on('error', err => {
                console.log('Unable to download project: ' + err.message);
            })
            .on('end', () => {})
            .pipe(ws);
    });
};

exports.initialize = function() {
    const cookie = exports.cookie;
    if (!cookie) return Promise.resolve();

    const sid = cookie.sid;
    const options = {
        baseUrl: host,
        uri: '/auth/about',
        headers: {
            Cookie: 'connect.sid=' + sid
        },
        json: true
    };
    return request(options)
        .then(res => {
            if (res.statusCode === 200) {
                setCookie(res.body, sid);
            } else {
                setCookie(null);
            }
            return exports.cookie;
        });
};

exports.list = function() {};

exports.test = function() {
    test(false);
};

exports.submit = function() {
    test(true);
};

function appData(value) {
    if (arguments.length > 0) {
        try {
            fs.writeFileSync(appDataPath, value);
        } catch (err) {
            console.error('Unable to write app data: ' + err.message);
        }

    } else {
        try {
            value = fs.readFileSync(appDataPath, 'utf8');
        } catch (err) {
            value = null;
        }
        return value;
    }
}

function getCookie() {
    try {
        const content = fs.readFileSync(cookiePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw Error('Unable to get cookie: ' + err.message);
        } else {
            return null;
        }
    }
}

function findProjectDir(dir) {
    const files = fs.readdirSync(dir);
    const count = files.length;
    let i;
    for (i = 0; i < count; i++) {
        if (files[i] === 'package.json' && fs.statSync(path.resolve(dir, files[i])).isFile()) return dir;
    }

    const parent = path.dirname(dir);
    return parent === dir ? null : findProjectDir(parent);
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

function report(data) {
    console.log(data);
}

function request(options) {
    return new Promise((resolve, reject) => {
        Request(options, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

function setCookie(data, sid) {
    if (!data || !sid) {
        try {
            fs.unlinkSync(cookiePath);
            exports.cookie = null;
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw Error('Could not remove cookie');
            } else {
                throw err;
            }
        }
    } else {
        try {
            delete data.accessToken;
            delete data.classes;
            data.sid = sid;
            if (!data.displayName) data.displayName = data.username;

            fs.writeFileSync(cookiePath, JSON.stringify(data));
            exports.cookie = data;
        } catch (err) {
            throw Error('Unable to write cookie');
        }
    }
}

function stat(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, function(err, stats) {
            if (err) return reject(err);
            resolve(stats);
        });
    });
}

function test(submit) {
    if (!exports.cookie) return Promise.reject(Error('You must be authenticated for this command.'));

    const project = process.argv[3];
    const cwd = findProjectDir(process.argv[4] || process.cwd());

    // check to see if the project exists before uploading
    const reqPromise = request({
        baseUrl: baseUrl,
        uri: '/projects/' + project,
    });

    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    try {

        // create the output path
        const output = fs.createWriteStream(zipPath);

        // once done writing to output then send to server
        output.on('close', function () {
            reqPromise.then(res => {
                switch (res.statusCode) {
                    case 200:
                        const options = {
                            method: 'put',
                            baseUrl: baseUrl,
                            uri: '/client/test/' + project,
                            qs: {
                                action: submit ? 'submit' : 'test'
                            },
                            headers: {
                                Cookie: 'connect.sid=' + exports.cookie.sid
                            }
                        };
                        const req = Request(options, function (err, res) {
                            if (err) return deferred.reject(Error('Failed to upload project: ' + err.message));

                            const code = res.statusCode;
                            switch (code) {
                                case 200:
                                    return report(res.body);
                                case 401:
                                    setCookie(null);
                                    return deferred.reject(Error('Authentication invalid'));
                                default:
                                    return deferred.reject(Error(`Unable to test project: (${ res.statusCode }) ${ res.body }`));
                            }
                        });
                        fs.createReadStream(zipPath).pipe(req);
                        break;

                    default:
                        return deferred.reject(Error('Cannot test project: (' + res.statusCode + ') ' + res.body));
                }
            });
        });

        // create zip from files
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        // pipe zip into file
        archive.pipe(output);

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function (err) {
            console.warn(err.message)
        });

        // good practice to catch this error explicitly
        archive.on('error', function (err) {
            deferred.reject(err.message);
        });

        // get only file path for files that don't reside within node modules and that are not private
        const rxRecursive = /node_modules|bower_components|test/;
        const rxFilter = /(?:(?:^|[\/\\])(?:\..|private)|node_modules|bower_components|(?:\.zip$))|(^test[\/\\])/;
        const filter = (filePath, stats) => !rxFilter.test(filePath) && stats.isFile();
        const recursive = filePath => {
            const relPath = path.relative(cwd, filePath);
            return !rxRecursive.test(relPath);
        };

        readDir(cwd, {filter, recursive})
            .then(paths => {

                paths.forEach(fullPath => {
                    const relative = path.relative(cwd, fullPath);
                    archive.file(fullPath, {name: relative});
                });

                // finalize the archive (ie we are done appending files but streams have to finish yet)
                archive.finalize();
            });

    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}