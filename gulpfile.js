// List all available tasks
const organiser = require('gulp-organiser');
organiser.registerAll('./tasks', {
	'copy-static': {},
  'build-elm': {
    src: 'src/Main.elm',
    dest: 'dist',
    moduleName: 'ModalRouter',
    ext: 'js',
  },
});
