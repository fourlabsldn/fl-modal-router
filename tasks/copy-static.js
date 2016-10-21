const gulp = require('gulp');
const organiser = require('gulp-organiser');
const { map, reduce, get, uniqBy, flow, filter } = require('lodash/fp');

module.exports = organiser.register((task, allTasks) => {
  // All paths with an src
  const excludePaths = getExcludedPaths(task, allTasks);
  const folderMapping = task.map || {};

  gulp.task(task.name, (done) => {
    const mapped = Object.keys(folderMapping);
    const exclude = [...excludePaths, ...mapped];

    copy(task.src, task.dest, exclude);

    // Copy mapped folders
    mapped.forEach(p => copy([p], folderMapping[p], excludePaths));

    // Allow some time for the task to complete, otherwise other tasks that depend
    // on it may not get the files they need
    setTimeout(done, 500);
  });
});

function copy(orig, dest, exclude) {
  const toExclude = exclude.map(p => `!${p}`);
  const src = [...orig, ...toExclude];
  console.log('Copying:', src);

  gulp.src(src)
    .pipe(gulp.dest(dest));
}

function getExcludedPaths(task, allTasks) {
  return flow(
    map(get('src')),
    // merge all sources into one big src array
    reduce((allSrc, src) => allSrc.concat(src), []),
    filter(p => !task.src.includes(p)),
    uniqBy(String) // Remove repeated paths
  )(allTasks);
}
