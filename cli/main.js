'use strict';
const cli = {
    account: require('./account'),
    assignment: require('./assignment')
};

const args = Array.from(process.argv).slice(2);
const cmd = args[0];
const sub = args[1];

if (!cli.hasOwnProperty(cmd) || !cli[cmd].hasOwnProperty(sub)) {
    console.log(`
Try one of the following commands:

it410 admin create                      - create a new assignment
it410 admin publish                     - publish a created assignment
it410 admin remove                      - remove an existing assignment

it410 account create                    - create a new account
it410 account grades                    - get your current grades
it410 account reset                     - reset your password
it410 account update                    - update account details

it410 assignment evaluate [dir]         - evaluate an assignment
it410 assignment init [name] [outdir]   - initialize an assignment
it410 assignment list                   - list all assignments
it410 assignment submit [dir]           - submit an assignment
    `);
} else {
    cli[cmd][sub]()
        .catch(err => console.error(err.stack));
}