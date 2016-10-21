// List all available tasks
const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
  'transpile-to-es5': {
    src: './dist/pre-transpilation.js',
    dest: './dist',
    rename: 'fl-modal-router.js',
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
    moduleName: 'ModalRouter',
    ext: 'js',
  },
  'browser-sync': {
    src: '.', // it doesn't matter, it's just so the task object is not ignored.
    reloadOn: ['build-elm', 'copy-static'],
    startPath: 'demo/index.html',
    baseDir: './',
  },
  concat: {
    src: ['dist/ModalRouter.js', 'dist/ports.js'],
    dest: 'dist',
    fileName: 'pre-transpilation.js',
  },
});
