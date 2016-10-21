// List all available tasks
const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
  'transpile-to-es5': {
    src: './src/*.js',
    dest: './dist',
  },
  'build-elm': {
    watch: 'src/**/*',
    src: 'src/Main.elm',
    dest: 'dist',
    moduleName: 'index-elm',
    ext: 'js',
  },
  'browser-sync': {
    src: '.', // it doesn't matter, it's just so the task object is not ignored.
    reloadOn: ['build-elm', 'copy-static'],
    startPath: 'demo/index.html',
    baseDir: './',
  },
  concat: {
    src: ['dist/index-elm.js', 'dist/ports.js'],
    dest: 'dist',
    fileName: 'fl-modal-router.js',
  },
});
