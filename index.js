#!/usr/bin/env node
process.on('unhandledRejection', err => {
    console.error(err.stack);
    process.exit(1);
});

const request       = require('./request');

request.initialize()
    .then(cookie => {
        const command = process.argv[2];

        if (cookie) {
            const help = `
\u001b[7m  Welcome ${cookie.displayName}  \u001b[0m


Usage: it410 <command>

Options:

  -h, --help  Output usage information


Commands:

  exit                     Log out
  get <project> [dest]     Download a project to the specified directory. Defaults to current directory.
  list                     List projects
  help                     Output usage information
  submit <project> [src]   Test and submit a project. Defaults to using the current directory as the project.
  test <project> [src]     Test a project. Defaults to using the current directory as the project.
  ${ cookie.administrator ? 'upload <project> [src]   Upload a project.' : '' }
`;

            switch (command) {
                case 'exit':
                case 'get':
                case 'list':
                case 'submit':
                case 'test':
                    return request[command]();

                case 'help':
                case '-h':
                case '--help':
                    console.log(help);
                    break;

                default:
                    if (process.argv[2]) console.error('Unknown command: ' + process.argv[2]);
                    console.log(help);
            }

        } else {
            const help = `
\u001b[7m  You are not logged in                        \u001b[0m
\u001b[7m  Please log in to enable additional commands  \u001b[0m


Usage: it410 <command>

Options:

  -h, --help  Output usage information


Commands:

  authenticate <token>     Log in.
  get <project> [dest]     Download a project to the specified directory. Defaults to current directory.
  list                     List projects
  help                     Output usage information
`;

            switch (command) {

                case 'authenticate':
                case 'get':
                case 'list':
                    return request[command]();

                case 'help':
                case '-h':
                case '--help':
                    console.log(help);
                    break;

                default:
                    if (process.argv[2]) console.error('Unknown command: ' + process.argv[2]);
                    console.log(help);
            }
        }
    })
    .catch(err => {
        console.error(err.message);
        process.exit(1);
    });