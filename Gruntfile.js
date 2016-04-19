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
    watch: {
      js: {
        files: 'src/**/*.js',
        tasks: ['js-build'],
        options: {
          livereload: true,
        },
      },
      tests: {
        files: 'tests-src/**/*.js',
        tasks: ['build-tests'],
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
          specs: 'tests-build/functional/**/*-specs.js',
          helpers: ['./tests-build/helpers/*.js'],
          vendor: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/x-div/js/x-div-tester.js',
          ],
        },
      },
      unit: {
        // src: 'src/**/*.js',
        options: {
          specs: 'tests-build/unit/**/*-specs.js',
          helpers: ['./tests-build/helpers/*.js'],
          vendor: [
            'bower_components/jquery/dist/jquery.min.js',
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
              presets: ['es2015-rollup'],
            }),
          ];
        },
      },
      main: {
        dest: 'dist/fl-modal-router.js',
        src: 'src/main.js', // Only one source file is permitted
      },
      testsFunctional: {
        dest: 'tests-build/functional/functional-specs.js',
        src: 'tests-src/functional/functional-specs.js',
      },
      testsUnit: {
        dest: 'tests-build/unit/unit-specs.js',
        src: 'tests-src/unit/unit-specs.js',
      },
      testsHelpers: {
        dest: 'tests-build/helpers/helpers.js',
        src: 'tests-src/helpers/helpers.js',
      },
    },
    uglify: {
      build: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/fl-modal-router.min.map',
        },
        files: {
          'dist/fl-modal-router.min.js': ['dist/fl-modal-router.js'],
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-rollup');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', []);

  // Showing demo
  grunt.registerTask('demo', ['open:demo']);

  // Building
  grunt.registerTask('build', ['rollup:', 'uglify']);
  grunt.registerTask('build-tests', [
    'rollup:testsFunctional',
    'rollup:testsUnit',
    'rollup:testsHelpers',
  ]);

  // Developing & Testing
  grunt.registerTask('dev', [
    'build',
    'build-tests',
    'jasmine',
    'http-server',
    'open:demo',
    'watch',
  ]);
  grunt.registerTask('test-unit', [
    'build',
    'build-tests',
    'jasmine:unit:build',
    'open:test',
    'watch',
  ]);
  grunt.registerTask('test-functional', [
    'build',
    'build-tests',
    'jasmine:functional:build',
    'open:test',
    'watch',
  ]);
  grunt.registerTask('test', ['build', 'build-tests', 'jasmine']);
};
