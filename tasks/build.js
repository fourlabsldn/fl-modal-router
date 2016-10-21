/* eslint-disable global-require */

const gulp = require('gulp');
const organiser = require('gulp-organiser');

const buildTasks = [
  require('./build-elm'),
  require('./transpile-to-es5'),
  require('./concat'),
].map(t => t.name);

module.exports = organiser.register((task) => {
  gulp.task(task.name, buildTasks);
});
