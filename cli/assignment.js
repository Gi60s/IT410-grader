'use strict';
const account           = require('../bin/account');
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

    const result = await account.create(answers.username, answers.password, answers.email, answers.firstName + ' ' + answers.lastName);
    console.log(result.message);
};

function required(v) {
    return v.length > 0;
}