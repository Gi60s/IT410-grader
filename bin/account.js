'use strict';
const config        = require('./config');
const Request       = require('request-promise-native');

module.exports = Account;

function Account(username) {
    if (!/^[a-z0-9]+$/i.test(username)) throw Error('The username can only contain alphanumeric characters.');

    this.authenticated = false;
    this.username = username;
    this.password = undefined;
    this.email = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.roles = [];
    this.submissions = [];

    Object.defineProperty(this, 'authorization', {
        get: () => {
            if (!this.password) return 'None';
            return 'Basic ' + Buffer.from(this.username + ':' + this.password, 'ascii').toString('base64')
        }
    });
}

/**
 * Get account grades and remaining assignments
 * @param {string} [username] The username to get assignments for. Defaults to own.
 * @returns {Promise.<{success:boolean,message:string}>}
 */
Account.prototype.assignments = async function(username) {
    /*const res = await request({
        method: 'POST',
        uri: config.host + '/assignments',
        headers: { Authorization: this.authorization },
        json: true,
        resolveWithFullResponse: true,
        simple: false
    });

    return { success: res.statusCode === 200, message: res.body };*/
};

/**
 * Create an account.
 * @param {string} password
 * @param {string} email
 * @param {string} firstName
 * @param {string} lastName
 * @returns {Promise.<{success:boolean,message:string}>}
 */
Account.prototype.create = async function(email, password, firstName, lastName) {
    const res = await this.request('POST', '', {
        email,
        password,
        firstName,
        lastName,
        username: this.username
    });
    if (res.statusCode !== 200) throw Error('Unable to create account: ' + res.body);
    return this.login(password);
};

/**
 * Get another account's details.
 * @param {string} username
 * @returns {Promise.<Account>}
 */
Account.prototype.get = async function(username) {
    if (!this.authenticated) throw Error('You must be logged in to perform this action.');

    const res = await this.request('GET', username);
    if (res.statusCode !== 200) throw Error('Unable to access account: ' + res.body);

    const account = new Account(username);
    account.email = res.body.email;
    account.firstName = res.body.firstName;
    account.lastName = res.body.lastName;
    account.roles = res.body.roles;
    account.submissions = res.body.submissions;

    return account;
};

Account.prototype.login = async function(password) {
    if (this.authenticated) return;

    const res = await this.request('GET', this.username);

    if (res.statusCode !== 200) throw Error('Invalid username or password.');

    this.authenticated = true;
    this.password = password;
    this.email = res.body.email;
    this.firstName = res.body.firstName;
    this.lastName = res.body.lastName;
    this.roles = res.body.roles;
    this.submissions = res.body.submissions;

    return this;
};

Account.prototype.remove = async function(username) {
    if (!this.authenticated) throw Error('You must be logged in to perform this action.');

    const res = await this.request('DELETE', username || this.username);

    if (res.statusCode === 404) return false;
    if (res.statusCode !== 204) throw Error('Error checking account existence: ' + res.body);
    return true;
};

Account.prototype.request = function(method, path, body) {
    const req = {
        method: method,
        uri: config.host + '/accounts' + (path ? '/' + path : ''),
        headers: { Authorization: this.authorization },
        json: true,
        resolveWithFullResponse: true,
        simple: false
    };
    if (body) req.body = body;
    return Request(req);
};

/**
 * Update your own account or another.
 * @param {object} [data]
 * @returns {Promise.<void>}
 */
Account.prototype.update = async function(data) {
    if (!this.authenticated) throw Error('You must be logged in to perform this action.');

    if (!data) data = {};
    const body = {
        username: data.username || this.username,
        password: data.password || this.password,
        email: data.email || this.email,
        firstName: data.firstName || this.firstName,
        lastName: data.lastName || this.lastName,
        roles: data.roles || this.roles
    };

    const res = await this.request('PUT', data.username || this.username, body);
    if (res.statusCode !== 200) throw Error('Error updating user: ' + res.body);

    if (body.username === this.username) {
        const body = res.body;
        this.password = body.password;
        this.email = body.email;
        this.firstName = body.firstName;
        this.lastName = body.lastName;
        this.roles = body.roles;
    }
};


/**
 * Check to see if an account with the username exists.
 * @param username
 * @returns {Promise.<boolean>}
 */
Account.exists = async function(username) {
    const res = await Request({
        method: 'GET',
        uri: config.host + '/accounts/' + username,
        json: true,
        resolveWithFullResponse: true,
        simple: false
    });

    if (res.statusCode === 404) return false;
    if (res.statusCode !== 200) throw Error('Error checking account existence: ' + res.body);
    return true;
};