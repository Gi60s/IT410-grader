'use strict';
const accounts           = require('../bin/account');
const inquirer          = require('inquirer');

exports.create = async function() {
    const questions = [
        {
            name: 'firstName',
            message: 'First Name:',
            validate: required
        },
        {
            name: 'lastName',
            message: 'Last Name:',
            validate: required
        },
        {
            name: 'email',
            message: 'Email Address:',
            validate: required
        },
        {
            name: 'username',
            message: 'Username:',
            validate: required
        }
    ];

    const answers = await inquirer.prompt(questions);
    answers.password = await confirmPassword();

    const result = await accounts.create(answers.username, answers.password, answers.email, answers.firstName + ' ' + answers.lastName);
    console.log(result.message);
};

exports.login = async function login() {
    const questions = [
        {
            name: 'username',
            message: 'Username:',
            validate: required
        },
        {
            name: 'password',
            message: 'Password:',
            validate: required
        }
    ];

    const answers = await inquirer.prompt(questions);
    const login = await accounts.login(answers.username, answers.password);

    if (!login) {
        console.log('Wrong username or password');
        process.exit();
    } else {
        return login;
    }
};

exports.update = async function() {
    const login = exports.login();
    
    const questions = [
        {
            name: 'firstName',
            message: 'First Name:',
            validate: required,
            default: login.firstName
        },
        {
            name: 'lastName',
            message: 'Last Name:',
            validate: required,
            default: login.lastName
        },
        {
            name: 'email',
            message: 'Email Address:',
            validate: required,
            default: login.email
        },
        {
            name: 'username',
            message: 'Username:',
            validate: required,
            default: login.username
        }
    ];

    const answers = await inquirer.prompt(questions);
    answers.password = await confirmPassword();

    const result = await accounts.update(answers.username, answers.password, answers.email, answers.firstName + ' ' + answers.lastName);
    console.log(result.message);
};


async function confirmPassword(label) {
    const questions = [
        {
            name: 'password',
            message: (label || 'Password') + ':',
            type: 'password',
            validate: required
        },
        {
            name: 'confirm',
            message: 'Confirm Password:',
            type: 'password',
            validate: required
        }
    ];
    const answers = await inquirer.prompt(questions);
    if (answers.password !== answers.confirm) {
        console.log('Passwords did not match.');
        return confirmPassword();
    } else {
        return answers.password;
    }
}

function required(v) {
    return v.length > 0;
}