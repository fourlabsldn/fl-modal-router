/* eslint-disable global-require */

const gulp = require('gulp');
const organiser = require('gulp-organiser');
const runSequence = require('run-sequence');

const buildTasks = [
  require('./build-elm'),
  require('./copy-static'),
  require('./concat'),
  require('./transpile-to-es5'),
].map(t => t.name);

module.exports = organiser.register((task) => {
  gulp.task(task.name, () => {
    runSequence(...buildTasks);
  });
});
