'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        karma: {
            unit: {
                configFile: './karma.conf.js',
                autowatch: true,
                singleRun: false
            }
        }
    });


    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['test']);
};
