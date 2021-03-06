; (function () {
    var cluster = require('cluster');
    if (cluster.isMaster) {
        return cluster.fork() && cluster.on('exit', function () { cluster.fork(); require('../lib/crashed'); });
    }

    var fs = require('fs');
    var config = { port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765 };
    var Gun = require('gun'); // require('gun')

    if (process.env.HTTPS_KEY) {
        console.log('launching https');
        config.key = fs.readFileSync(process.env.HTTPS_KEY);
        config.cert = fs.readFileSync(process.env.HTTPS_CERT);
        config.server = require('https').createServer(config, Gun.serve(__dirname));
    } else {
        console.log('launching plain http');
        config.server = require('http').createServer(Gun.serve(__dirname));
    }

    var gun = Gun({ radix: true, web: config.server.listen(config.port) });
    console.log('Relay peer started on port ' + config.port + ' with /gun');

    module.exports = gun;
}());