require('dotenv-safe').load({
    allowEmptyValues: true
});

var path = require('path');

var lessCreateConfig = function (context, block) {
    var cfg = {
        files: []
    };
    var outfile = path.join(context.outDir, block.dest);
    var filesDef = {

    };

    filesDef.dest = outfile;
    filesDef.src = [];

    context.inFiles.forEach(function (inFile) {
        filesDef.src.push(path.join(context.inDir, inFile));
    });

    cfg.files.push(filesDef);
    context.outFiles = [block.dest];
    return cfg;
};

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * <%= pkg.name %> v<%= pkg.version %>\n' +
            ' * ' + grunt.file.read('LICENSE') +
            ' */\n',

        availabletasks: {
            tasks: {
                options: {
                    filter: 'include',
                    tasks: ['tasks', 'test', 'serve', 'push', 'release']
                }
            }
        },

        kickoff: process.env.KICKOFF,

        path: {
            dist: process.env.PATH_PUB,
            src: process.env.PATH_SRC,
            temp: process.env.PATH_TMP
        },

        clean: {
            dist: '<%= path.dist %>',
            temp: '<%= path.temp %>'
        },

        concat: {
            options: {
                sourceMap: true,
                sourceMapStyle: 'inline'
            },
            dist: {
                options: {
                    banner: '<%= banner %>',
                    stripBanners: true,
                    sourceMap: false
                },
                src: '<%= path.temp %>/js/*.js',
                dest: '<%= path.dist %>/js/<%= kickoff %>.js'
            }
        },

        copy: {
            temp: {
                files: [{
                    expand: true,
                    cwd: '<%= path.src %>',
                    src: [
                        'tpl/**/*.html',
                        'img/**/.{gif,jpg,jpeg,png,svg,webp}'
                    ],
                    dest: '<%= path.temp %>'
                }]
            }
        },

        connect: {
            server: {
                options: {
                    useAvailablePort: true,
                    base: '<%= path.temp %>',
                    livereload: true,
                    open: true
                }
            }
        },

        includereplace: {
            options: {
                prefix: '<!-- @@',
                suffix: ' -->',
                includesDir: '<%= path.temp %>/tpl/partials',
                globals: {
                    name: '<%= pkg.name %>',
                    title: '<%= pkg.description %>',
                    ga_id: process.env.GA_ID
                }
            },
            temp: {
                files: [{
                    expand: true,
                    cwd: '<%= path.temp %>/tpl',
                    src: [
                        '*.html'
                    ],
                    dest: '<%= path.temp %>'
                }]
            }
        },

        jshint: {
            options: {
                jshintrc: '<%= path.src %>/js/.jshintrc'
            },
            core: {
                src: '<%= path.src %>/js/*.js'
            }
        },

        jscs: {
            options: {
                config: '<%= path.src %>/js/.jscsrc'
            },
            grunt: {
                src: 'Gruntfile.js'
            },
            core: {
                src: '<%= path.src %>/js/*.js'
            }
        },

        less: {
            options: {
                sourceMap: true,
                sourceMapFileInline: true
            }
        },

        uglify: {
            options: {
                compress: {
                    warnings: false
                },
                mangle: true,
                preserveComments: 'some'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: '<%= path.dist %>/js/<%= kickoff %>.min.js'
            }
        },

        usemin: {
            html: [
                '<%= path.temp %>/tpl/**/*.html'
            ],
            css: [
                '<%= path.temp %>/assets/css/{,*/}*.css'
            ],
            options: {
                assetsDirs: [
                    '<%= path.temp %>'
                ],
                blockReplacements: {
                    less: function (block) {
                        return '<link rel="stylesheet" href="' + block.dest + '">';
                    }
                }
            }
        },

        useminPrepare: {
            html: '<%= path.src %>/tpl/partials/*.html',
            options: {
                dest: '<%= path.temp %>',
                staging: '<%= path.temp %>',
                flow: {
                    steps: {
                        js: [
                            'concat'
                        ],
                        less: [{
                            name: 'less',
                            createConfig: lessCreateConfig
                        }]
                    },
                    post: {}
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            grunt: {
                options: {
                    nospawn: true
                },
                files: ['Gruntfile.js', 'package.json'],
                tasks: ['serve']
            },
            src: {
                files: [
                    '<%= path.src %>/js/**/*.js',
                    '<%= path.src %>/less/**/*.less',
                    '<%= path.src %>/tpl/**/*.html'
                ],
                tasks: ['temp']
            },
            temp: {
                files: ['<%= path.temp %>/**/*']
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.registerTask('default', [
        'tasks'
    ]);

    grunt.registerTask('tasks', 'List available Grunt tasks & targets.', [
        'availabletasks'
    ]);

    grunt.registerTask('test', 'Run tests and code validation tasks.', [
        'jshint',
        'jscs'
    ]);

    grunt.registerTask('serve', 'Start the local server with livereload for development purposes.', [
        'temp',
        'connect',
        'watch'
    ]);

    grunt.registerTask('release', 'Bump version, build dist files and push new version into git repository.', [
        'test',
        'bump-only:' + (grunt.option('bump') || 'minor'),
        'dist',
        'bump-commit'
    ]);

    grunt.registerTask('push', 'Just push actual files into git repository.', [
        'test',
        'dist',
        'bump-commit'
    ]);

    grunt.registerTask('dist', [
        'clean',
        'temp',
        'concat:dist',
        'uglify:dist'
    ]);

    grunt.registerTask('temp', [
        'copy:temp',
        'useminPrepare',
        'concat:generated',
        'less:generated',
        'usemin',
        'includereplace:temp'
    ]);
};
