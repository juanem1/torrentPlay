var gulp = require('gulp');
var exec = require('gulp-exec');
var builder = require('gulp-nw-builder');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var fs = require('fs');


var BUILD_VERSION = 'v0.12.2';


/**
 * Start task
 * Run: gulp start
 */
gulp.task('start', function() {
    var paths = {
        osx32: 'build/torrentPlay/osx32/torrentPlay.app/Contents/MacOS/nwjs .',
        osx64: 'build/torrentPlay/osx64/torrentPlay.app/Contents/MacOS/nwjs .',
        win32: 'build/torrentPlay/win32/torrentPlay.exe .',
        win64: 'build/torrentPlay/win64/torrentPlay.exe .'
    };

    var options = {
        // default = false, true means don't emit error event
        continueOnError: false,

        // default = false, true means stdout is written to file.contents
        pipeStdout: false,

        // content passed to gutil.template()
        customTemplatingThing: 'test'
    };

    var reportOptions = {
        // default = true, false means don't write err
        err: true,

        // default = true, false means don't write stderr
        stderr: true,

        // default = true, false means don't write stdout
        stdout: true
    };

    gulp.src('./src')
        .pipe(exec(paths.osx64, options))
        .pipe(exec.reporter(reportOptions));
});

/**
 * Build task
 * Run: gulp build
 */
gulp.task('build', function() {
    runSequence(
        'build:clean',
        'generate-source-package-json',
        'build:make',
        'build-copy-node-modules'
    );
});


/**********************************************************************
 * PRIVATE TASKS
 *********************************************************************/

/**
 * Remove old build folder before build
 */
gulp.task('build:clean', function() {
    return gulp.src('./build', {read: false}).pipe(clean());
});

/**
 * Generate a new build folder
 */
gulp.task('build:make', function() {
    return gulp.src([
        './src/**/*'
    ]).pipe(
        builder({
            version: BUILD_VERSION,
            platforms: ['osx64']
        })
    );
});

/**
 * Copy node modules to the build directory
 */
gulp.task('build-copy-node-modules', function() {

    var nm = './node_modules/';

    var modules = [
        'airplay-js',
        'numeral',
        'read-torrent',
        'simple-cors-file-server',
        'srt2vtt2'
    ];

    var destinations = [
        // OSX 32
        'build/torrentPlay/osx32/torrentPlay.app/Contents/Resources/app.nw/node_modules/',
        // OSX 64
        'build/torrentPlay/osx64/torrentPlay.app/Contents/Resources/app.nw/node_modules/'
    ];

    for (var i = 0, len = destinations.length; i < len; i++) {
        for (var z = 0, len2 = modules.length; z < len2; z++) {
            gulp.src(nm + modules[z] + '/**/*').pipe(gulp.dest(destinations[i] + modules[z]));
        }
    }
});

/**
 * Remove ./src/package.json
 */
gulp.task('remove-old-package-definition', function() {
    return gulp.src('./src/package.json', {read: false}).pipe(clean());
});

/**
 * Create dynamically package.json to generate the build.
 */
gulp.task('generate-source-package-json', ['remove-old-package-definition'],function() {

    // I use some definitions from the main package.json
    var packageDefinition = require('./package.json');

    // Content for the file
    var content = {
        name: packageDefinition.name,
        version: packageDefinition.version,
        main: 'index.html',
        dependencies: {}
    };

    // Convert Object to json string
    var json = JSON.stringify(content, null, 2);

    fs.writeFile('./src/package.json', json, function(err) {
        if (err) throw err;
    });
});