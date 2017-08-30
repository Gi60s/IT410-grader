# it410-grader

This tool is used to grade assignments for the IT410 Advanced Web Development course. Using this tool you can grade your own assignments prior to submitting them and consequentially you'll know what score you'll be receiving.

## Installation

1. Install [NodeJS](https://nodejs.org/)
2. Install [Docker](https://www.docker.com/products/overview)
3. From the terminal, run `npm install -g Gi60s/IT410-grader`

## Grading

To see what grade you'll get on an assignment you can run the `it410-grader`.

```sh
$ it410-grader <assignment_id> [directory | github-url] [date]
```

You must specify the assignment_id that is specified in each assignment's README.md file. You can optionally define the directory to use as your assignment that is to be graded, or you can specify a github URL that your project has been pushed to. If you don't specify either then the current directory will be used as your assignment's directory.

**Parameters**:

- *assignment_id* - The id of the assignment you want to grade. This id is specified in the README.md file for each assignment.

- *directory* or *github-url* - Optional. The location where your source files for the assignment exist. If not specified the current directory will be used.

  Due to networking delays it will be faster to run tests from a local directory, but know that your final assignment will be graded by your github repository code. Make sure that you have that repository updated and tested.

- *date* - Optional. This parameter is only useful if a github-url is used. It will fetch the github code and grade it in the state it was in at the end of the specified date. For example, if you set this value as `2017-01-15` then the grading will be against the github repository as it stood at 11:59:59 PM on January 15, 2017.

**Returns**

After running this command you'll see output that tells which tests you passed, which you failed, and how many of each.

Your final grade for the assignment will be based on the number of passing tests over possible tests. Additionally, if the assignment is late you're grade for the assignment will be reduced by 20%.

**Example**

You can actually try this command out if you've done the installation:

```sh
$ it410-grader hello-world https://github.com/Gi60s/hello-world.git
```


# Set Up

Build Docker Image

```sh
$ docker build -t it410 .
```

Run Docker Image in Interactive Terminal

```sh
$ docker run --rm -it it410 [assignment]
```

Test Code In Local Volume

```sh
$ docker run --rm -it -v /abs/path:/it410/volume it410 [assignment]
```

Test Code from Github

```sh
$ docker run --rm -it it410 [assignment] [github-url]
```