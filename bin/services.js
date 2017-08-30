'use strict';
const config        = require('./config');
const http          = require('http');
const https         = require('https');
const inquirer      = require('inquirer');
const querystring   = require('querystring');
const request       = require('request-promise-native');

const host = config.protocol + '://' + config.host + ':' + config.port;

/**
 * Get all known assignments.
 */
exports.assignments = function() {

};

exports.create = async function(username, password, dirPath) {
    await authenticate(username, password);
    return;


    const pkg = await exports.getPackageDescription(dirPath);
    const zip = exports.zip(dirPath, true);

    const options = {
        uri: host + '/assignments/',
        method: 'POST'
    }
    //zip.pipe(request({ method: 'POST', })
    // TODO: create archive and push to server
};

exports.evaluate = function(dirPath) {
    // TODO: create archive and evaluate against assignment on server
};

/**
 * Download an assignment and unzip it to the specified directory.
 * @param {string} assignment The assignment name.
 * @param {string} outputDirectory The directory to output the assignment to.
 * @returns {Promise.<void>}
 */
exports.starter = async function(assignment, outputDirectory) {
    console.log('Getting assignment: ' + assignment);
    try {
        const res = await request({
            uri: host + '/assignments/' + assignment,
            encoding: null
        });

        // check if the directory exists
        const destination = path.resolve(outputDirectory, assignment);
        const exists = await files.exists(destination);

        // if directory exists then make sure it's empty
        if (exists) {
            const items = await files.readDir(destination);
            if (items.length > 0) {
                const answers = await inquirer.prompt([{
                    type: 'confirm',
                    name: 'overwrite',
                    default: false,
                    message: 'The specified directory (' + destination + ') is not empty. Continue and overwrite duplicate files'
                }]);

                if (!answers.overwrite) {
                    console.log('Cancelled');
                    return;
                }
            }
        }

        // decompress the files to the destination directory
        await decompress(res, destination);
        console.log('Assignment saved to ' + destination);

    } catch (err) {
        if (err.name === 'StatusCodeError' && err.statusCode === 404) {
            console.log('Assignment not found');
        } else {
            console.error(err.message);
        }
    }
};

exports.submit = function(username, password, assignment) {
    // TODO: create archive and push to server for evaluation and grading
};

function authenticate(username, password) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            netid: username,
            password: password
        });

        const options = {
            hostname: 'cas.byu.edu',
            port: 443,
            path: '/cas/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            }
        };

        const req = https.request(options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            res.on('data', (d) => {
                process.stdout.write(d);
            });

            res.on('close', () => {
                resolve();
            })
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}