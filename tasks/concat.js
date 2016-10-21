const gulp = require('gulp');
const organiser = require('gulp-organiser');

const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

module.exports = organiser.register((task) => {
  gulp.task(task.name, () => {
    return gulp.src(task.src)
      .pipe(sourcemaps.init())
        .pipe(concat(task.fileName))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(task.dest));
  });
});
