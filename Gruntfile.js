/* globals module, require*/
const babel = require('rollup-plugin-babel');

module.exports = function Gruntfile(grunt) {
  grunt.initConfig({
    open: {
      demo: {
        path: 'http://localhost:8282/demo/index.html',
      },
      test: {
        path: './_SpecRunner.html',
      },
    },
    // concat: {
    //   options: {
    //     banner: '(function () {',
    //     footer: '}());',
    //     separator: '\n',
    //   },
    //   dist: {
    //     src: [
    //       'src/utils.js',
    //       'src/*.js',
    //     ],
    //     dest: 'dist/fl-modal-router.js',
    //   },
    // },
    sass: {
      dist: {
        options: {
          style: 'expanded',
        },
        files: {
          'dist/fl-modal-router.css': 'src/**/*.scss',
        },
      },
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: ['last 2 versions'],
          }),
        ],
      },
      dist: {
        src: 'dist/*.css',
      },
    },
    uglify: {
      main: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/fl-modal-router.map',
        },
        files: {
          'dist/fl-modal-router.min.js': ['dist/fl-modal-router.js'],
        },
      },
    },
    watch: {
      css: {
        files: 'src/**/*.sass',
        tasks: ['css-build'],
        options: {
          livereload: true,
        },
      },
      js: {
        files: 'src/**/*.js',
        tasks: ['js-build'],
        options: {
          livereload: true,
        },
      },
      tests: {
        files: 'tests/**/*.js',
        options: {
          livereload: true,
        },
      },
    },
    'http-server': {
      dev: {
        root: './',
        port: 8282,
        showDir: true,
        autoIndex: true,
        ext: 'html',
        runInBackground: true,
        customPages: {
          '/readme': 'README.md',
        },
      },
    },
    jasmine: {
      functional: {
        src: 'dist/fl-modal-router.js',
        options: {
          specs: 'tests/functional/**/*-specs.js',
          helpers: ['./tests/helpers/*.js'],
          vendor: [
            'bower_components/x-div/js/x-div-tester.js',
          ],
        },
      },
      unit: {
        src: 'src/**/*.js',
        options: {
          specs: 'tests/unit/**/*-specs.js',
          helpers: ['./tests/helpers/*.js'],
          vendor: [
            'bower_components/x-div/js/x-div-tester.js',
          ],
        },
      },
    },
    rollup: {
      options: {
        plugins: () => {
          return [
            babel({
              exclude: './node_modules/**',
            }),
          ];
        },
      },
      main: {
        dest: 'dist/fl-modal-router.js',
        src: 'src/main.js', // Only one source file is permitted
      },
    },
  });

  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-rollup');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', []);

  // Showing demo
  grunt.registerTask('demo', ['open:demo']);

  // Building
  grunt.registerTask('js-build', ['rollup', 'uglify']);
  grunt.registerTask('css-build', ['sass', 'postcss']);
  grunt.registerTask('build', ['js-build', 'css-build']);

  // Developing & Testing
  grunt.registerTask('dev', [
    'build',
    'jasmine',
    'http-server',
    'open:demo',
    'watch',
  ]);
  grunt.registerTask('test-unit', [
    'build',
    'jasmine:unit:build',
    'open:test',
    'watch',
  ]);
  grunt.registerTask('test-functional', [
    'build',
    'jasmine:functional:build',
    'open:test',
    'watch',
  ]);
  grunt.registerTask('test', ['jasmine']);
};
