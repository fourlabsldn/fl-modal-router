// List all available tasks
const jsPart = 'main.js';
const elmPart = 'compiled-elm.js';
const output = 'fl-modal-router.js';

const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
  'transpile-to-es5': {
    src: `./src/${jsPart}`,
    dest: './dist',
    rename: output,
    config: {
      moduleName: 'ModalRouter',
    },
  },
  'build-elm': {
    watch: 'src/**/*',
    src: 'src/Elm/Main.elm',
    dest: 'src',
    output: elmPart,
  },
  'browser-sync': {
    src: '.', // it doesn't matter, it's just so the task object is not ignored.
    reloadOn: ['build-elm', 'copy-static'],
    startPath: 'demo/index.html',
    baseDir: './',
  },
});
