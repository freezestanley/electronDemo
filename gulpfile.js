const gulp = require('gulp')
const shell = require('gulp-shell')

const SVN_PROJECT_PATH = '/Users/chenzaining/Desktop/workspace/wow-app/static/js'
const SVN_PROJECT_DIST_PATH = '/Users/chenzaining/Desktop/workspace/wow-app/dist/bundle/js'
// const SVN_PROJECT_PATH = '/Users/easonzhu/work/wow-app/static/js'
// const SVN_PROJECT_DIST_PATH = '/Users/easonzhu/work/wow-app/dist/bundle/js'

gulp.task('build', shell.task(['npm run build', 'echo build done', `cp -af dist/eye.js ${SVN_PROJECT_PATH}`, `cp -af dist/eye.js ${SVN_PROJECT_DIST_PATH}`, 'echo copy done']))