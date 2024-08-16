const { src, dest, watch, parallel, series } = require("gulp");
// const { src, dest } = require("gulp");

// const sass = require('gulp-sass')(require('sass'));
const sass          = require('sass'); 
const gulpsass      = require('gulp-sass')(sass); 

const ejs           = require("gulp-ejs");
const rename        = require("gulp-rename");
const eslint        = require("gulp-eslint");
const sync          = require("browser-sync").create();


// ----------------------------------
// ERROR - Error [ERR_REQUIRE_ESM]: require() of ES Module .... is not supported - .../node_modules/gulp-mocha/index.js
//    Instead change the require of index.js in /home/mattharg/dev/demo-express-app/gulp-project/gulpfile.js to a dynamic import() which is available in all CommonJS modules.
//        at Object.<anonymous> (/home/mattharg/dev/demo-express-app/gulp-project/gulpfile.js:8:23) {

//const mocha         = require("gulp-mocha");
// const mocha         = require("fix-esm").require("gulp-mocha");

// const fixesm        = require("fix-esm").register();
// const mocha         = require("gulp-mocha");

// PROFORMA const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const mocha = (...args) => import('gulp-mocha').then(({default: mocha}) => mocha(...args));

//import('gulp-mocha') 
//.then((res)=>{ console.log(res) })         
//.catch((err)=>{ console.log(err) });



// ----------------------------------




function mytask(callback) {
   // task body
   callback();
}

function copy(cb) {
    src('routes/*.js')
        .pipe(dest('copies'));
    cb();
}

function generateCSS(cb) {
    src('./sass/**/*.scss')
        .pipe(gulpsass().on('error', gulpsass.logError))
        .pipe(dest('public/stylesheets'))
        .pipe(sync.stream());
    cb();
}

function generateHTML(cb) {
    src("./views/index.ejs")
        .pipe(ejs({
            title: "Hello Semaphore!",
        }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(dest("public"));
    cb();
}

function runLinter(cb) {
    return src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format()) 
        .pipe(eslint.failAfterError())
        .on('end', function() {
            cb();
        });
}

function runTests(cb) {
//    import mocha from "gulp-mocha";

// MSH: FIXME: The below will fail with 'mocha' not found - that's because the package has moved to ESM, and we cannot find a way to load the new ESM packages.  Massive attempt to achieve this, but, to no avail.
    return src(['**/*.test.js'])
        .pipe(mocha())
        .on('error', function() {
            cb(new Error('Test failed'));
        })
        .on('end', function() {
            cb();
        });
}

function watchFiles(cb) {
    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch([ '**/*.js', '!node_modules/**'], parallel(runLinter, runTests));
}

function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "./public"
        }
    });

    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch("./public/**.html").on('change', sync.reload);
}



exports.mytask = mytask;
exports.copy   = copy;
exports.css    = generateCSS;
exports.html   = generateHTML;
exports.lint   = runLinter;

exports.test   = runTests;
exports.watch  = watchFiles;

exports.sync = browserSync;

// exports.default = series(runLinter,parallel(generateCSS,generateHTML),runTests);
exports.default = series(runLinter,parallel(generateCSS,generateHTML));




