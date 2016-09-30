// List all available tasks
const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
  'copy-static': {
    src: './src/*.js',
    dest: './dist',
  },
  'build-elm': {
    src: 'src/ModalRouter.elm',
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
});
