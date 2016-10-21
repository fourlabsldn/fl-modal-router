const gulp = require('gulp');
const organiser = require('gulp-organiser');

const buildElm = require('./build-elm').name;
const copyStatic = require('./copy-static').name;
const concat = require('./concat').name;

module.exports = organiser.register((task) => {
  gulp.task(task.name, [buildElm, copyStatic, concat]);
});
