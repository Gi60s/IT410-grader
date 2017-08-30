'use strict';

const config = {
    domain: 'localhost',
    port: 7800,
    protocol: 'http'
};

config.host = config.protocol + '://' + config.domain + ':' + config.port;

module.exports = config;