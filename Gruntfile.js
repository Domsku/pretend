'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        clean: {
            dist: [
                '.tmp/*',
                'dist/*'
            ]
        },

        concat: {
            dist: {
                files: {
                    '.tmp/pretend.js': [
                        'scripts/main.js',
                        'scripts/services/**/*.js'
                    ]
                }
            }
        },

        copy: {
            dist: {
                src: '.tmp/pretend.js',
                dest: 'dist/pretend.js',
                options: {
                    process: function (content) {
                        return '(function(){' + content + '}())';
                    }
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    mangle: false, // Setting this true breaks the code somehow.
                    compress: true,
                    expand: true,
                    flatten: true,
                    banner: '/** Built on <%= grunt.template.today("isoDateTime") %> **/\n'
                },
                files: {
                    'dist/pretend-min.js': ['dist/pretend.js']
                }
            }
        },

        karma: {
            unit: {
                configFile: './karma-unit.conf.js',
                autowatch: true,
                singleRun: false
            },
            integration: {
                configFile: './karma-integration.conf.js',
                autowatch: true,
                singleRun: false
            }
        }
    });

    grunt.registerTask('build', ['clean', 'concat', 'copy', 'uglify']);
    grunt.registerTask('unit', ['karma:unit']);
    grunt.registerTask('integration', ['karma:integration']);
    grunt.registerTask('default', ['test']);
};
