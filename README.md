# it410-grader

This tool is used to grade assignments for the IT410 Advanced Web Development course. Using this tool you can grade your own assignments prior to submitting them and consequentially you'll know what score you'll be receiving.

## Installation

1. Install the latest [NodeJS LTS version](https://nodejs.org/)
2. Install [Git](https://git-scm.com/downloads)
3. From the terminal, run `npm install -g Gi60s/it410-grader`
   
    If that install doesn't work for some reason you can do the following:
    
    1. Open a terminal
    2. Execute the command `git clone Gi60s/it410-grader`
    3. Navigate to the app directory: `cd it410-grader`
    4. Install: `npm install -g`

## Usage

From a terminal you can learn about how to use the grader by issuing the following command:

```bash
it410
```

To test assignments and submit assignments you'll need to authenticate using your authentication token.

1. Open a web browser to http://james.darktech.org
2. Authenticate with Github (top right corner)
3. Click the classes link.
4. Join a class.
5. Select the class.
6. At the top of the class page you'll see a grader token. Copy that value.
7. From a terminal execute the command `it410 authenticate <token>` where `<token>` is the grader token you've copied.
8. You can now test and submit assigments, but you'll first need to get an assignment. See the grader application help for more details: `it410 help` or just `it410`.