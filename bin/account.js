'use strict';
const config        = require('./config');
const request       = require('request-promise-native');

/**
 * Create an account.
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @param {string} fullname
 * @returns {Promise.<{success:boolean,message:string}>}
 */
exports.create = async function(username, password, email, fullname) {
    const res = await request({
        method: 'POST',
        uri: config.host + '/accounts',
        body: {
            username: username,
            password: password,
            email: email,
            fullname: fullname
        },
        json: true,
        resolveWithFullResponse: true
    });

    return res.statusCode === 200
        ? { success: true, message: 'Account created' }
        : { success: false, message: res.body };
};

/**
 * Get account grades and remaining assignments
 * @param {string} username
 * @param {string} password
 * @returns {Promise.<{success:boolean,message:string}>}
 */
exports.grades = async function(username, password) {
    const res = await request({
        method: 'POST',
        uri: config.host + '/assignments',
        body: {
            username: username,
            password: password
        },
        json: true,
        resolveWithFullResponse: true
    });

    return { success: res.statusCode === 200, message: res.body };
};

/**
 * Change account password.
 * @param {string} username
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise.<{success:boolean,message:string}>}
 */
exports.password = async function(username, oldPassword, newPassword) {
    const res = await request({
        method: 'PUT',
        uri: config.host + '/accounts/password',
        body: {
            username: username,
            password: oldPassword,
            newPassword: newPassword
        },
        json: true,
        resolveWithFullResponse: true
    });

    return res.statusCode === 200
        ? { success: true, message: 'Password updated' }
        : { success: false, message: res.body };
};

/**
 * Perform a password reset
 * @param {string} username
 * @param {string} [nonce]
 * @returns {Promise.<{success:boolean,message:string}>}
 */
exports.reset = async function(username, nonce) {
    const body = { username };
    if (arguments.length > 1) body.nonce = nonce;

    const res = await request({
        method: 'PUT',
        uri: config.host + '/accounts/password-reset',
        body: body,
        json: true,
        resolveWithFullResponse: true
    });

    return { success: res.statusCode === 200, message: res.body };
};