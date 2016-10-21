// List all available tasks
const jsPart = 'ports.js';
const elmPart = 'module.js';
const output = 'fl-modal-router.js';

const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
  'transpile-to-es5': {
    src: './dist/pre-transpilation.js',
    dest: './dist',
    rename: output,
    config: {
      moduleName: 'ModalRouter',
    },
  },
  'copy-static': {
    src: './src/*.js',
    dest: './dist',
  },
  'build-elm': {
    watch: 'src/**/*',
    src: 'src/Main.elm',
    dest: 'dist',
    output: elmPart,
  },
  'browser-sync': {
    src: '.', // it doesn't matter, it's just so the task object is not ignored.
    reloadOn: ['build-elm', 'copy-static'],
    startPath: 'demo/index.html',
    baseDir: './',
  },
  concat: {
    src: [`./dist/${elmPart}`, `./dist/${jsPart}`],
    dest: 'dist',
    fileName: 'pre-transpilation.js',
  },
});
