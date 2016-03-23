/*globals module*/

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    open: {
      demo: {
        path: './demo/index.html',
      },
      test: {
        path: './_SpecRunner.html',
      },
    },
    concat: {
      options: {
        banner: '(function () {',
        footer: '}());',
        separator: '\n',
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/fl-modal-router.js',
      },
    },
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
    jasmine: {
      functional: {
        src: 'dist/fl-modal-router.js',
        options: {
          specs: 'tests/functional/**/*-specs.js',
          helpers: ['./tests/helpers/*.js'],
          vendor: [
            'bower_components/x-div/js/x-div-tester.js'
          ]
        },
      },
      unit: {
        src: 'src/**/*.js',
        options: {
          specs: 'tests/unit/**/*-specs.js',
          helpers: ['./tests/helpers/*.js'],
          vendor: [
            'bower_components/x-div/js/x-div-tester.js'
          ]
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', []);

  //Showing demo
  grunt.registerTask('demo', ['open:demo']);

  //Building
  grunt.registerTask('js-build', ['concat', 'uglify']);
  grunt.registerTask('css-build', ['sass']);
  grunt.registerTask('build', ['js-build', 'css-build']);

  //Developing & Testing
  grunt.registerTask('dev', [
    'build',
    'jasmine',
    'open:demo',
    'watch']);
  grunt.registerTask('test-unit', [
    'build',
    'jasmine:unit:build',
    'open:test',
    'watch']);
  grunt.registerTask('test-functional', [
    'build',
    'jasmine:functional:build',
    'open:test',
    'watch']);
  grunt.registerTask('test', ['jasmine']);
};
