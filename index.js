#! /usr/bin/env node
'use strict';

if (require.main === module) {
    require('./cli/main');
} else {
    exports.grader = require('./bin/grader');
}