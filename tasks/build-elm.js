const gulp = require('gulp');
const path = require('path');
const shell = require('gulp-shell');
const organiser = require('gulp-organiser');

module.exports = organiser.register((task) => {
  const {
    src,
    dest,
    outputFile = task.output || path.parse(task.src).name + '.js',
  } = task;

  const output = path.join(dest, outputFile);
  gulp.task(task.name, shell.task(`elm-make ${src} --output=${output}`));
});
