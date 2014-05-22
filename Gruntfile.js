'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        clean: {
            dist: [
                'dist/*'
            ]
        },

        uglify: {
            dist: {
                options: {
                    mangle: false, // Setting this true breaks the code somehow.
                    compress: true,
                    banner: '/** Built on <%= grunt.template.today("isoDateTime") %> **/\n'
                },
                files: [{
                    expand: true,
                    src: ['scripts/pretend.js'],
                    dest: 'dist',
                    flatten: true
                }]
            }
        },

        karma: {
            unit: {
                configFile: './karma.conf.js',
                autowatch: true,
                singleRun: false
            }
        }
    });

    grunt.registerTask('build', ['clean', 'uglify']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['test']);
};
