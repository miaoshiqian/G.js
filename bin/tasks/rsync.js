var rsync = require('rsyncwrapper').rsync;

module.exports = function (grunt) {
    'use strict';

    grunt.registerTask('rsync', 'Performs rsync tasks.',function () {
        var done = this.async();
        var servers = grunt.config('servers');
        var len = servers.length;
        servers.forEach(function (server) {
            server.src = grunt.config('dest');
            server.args = ["-aP"];
            try {
                rsync(server, function (error, stdout, stderr, cmd) {
                    grunt.log.writeln(cmd.grey);

                    if ( error ) {
                        grunt.log.writeln(error.toString().red);
                        grunt.log.error(server.host+' error'.red);

                        done(false);
                    } else {
                        grunt.log.write(stdout);
                        grunt.log.ok(server.host+' done'.green);

                        len --;
                        if (!len) {
                            done(true);
                        }
                    }
                });
            } catch (ex) {
                grunt.log.writeln("\n"+ex.toString().red);
                done(false);
            }
        });
    });
};