// This task will start all tasks in this folder
const gulp = require('gulp');
const organiser = require('gulp-organiser');

module.exports = organiser.register((task, allTasks) => {
  gulp.task(task.name, () => {
    allTasks.forEach(t => {
      console.log(`watching ${t.name}`);
      gulp.watch(t.src, [t.name]);
    });
  });
});
