"use strict";

const gulp          = require("gulp"),                  // для работы с gulp
      plumber       = require("gulp-plumber"),          // выводит ошибки в консоль
      server        = require("browser-sync").create(), // сервер для онлайн отслеживания изменений в
      del           = require("del"),                   // удаление папок
      sass          = require("gulp-sass"),             // компилирует из sass в css
      htmlmin       = require('gulp-htmlmin'),          // минификация html
      uglify        = require('gulp-uglify'),           // минификация js
      concat        = require('gulp-concat'),           // для сборки всех js в один файл с переименованием
      sourcemap     = require("gulp-sourcemaps"),       // для отладки кода
      postcss       = require("gulp-postcss"),          // для работы с autoprefixer
      autoprefixer  = require("autoprefixer"),          // прописывает стили для кроссбраузерности
      csso          = require("gulp-csso"),             // минификация css
      rename        = require("gulp-rename"),           // переименование файлов
      imagemin      = require("gulp-imagemin"),         // оптимизация картинок
      webp          = require("gulp-webp");             // конвертация картинок в формат webp

// Удаляет папку build
gulp.task("clean", function () {
  return del("build");
});

// создает минифицированный HTML
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
});

// Проверяет на ошибки, переводит scss в css, прописывает стили для разных браузеров и минифицирует css
gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

// Собирает все js файлы в один и минифицирует
gulp.task('js', function () {
  return gulp.src("source/js/*.js")
    // .pipe(sourcemap.init())
    // .pipe(concat("script.min.js"))
    // .pipe(uglify())
    // .pipe(sourcemap.write("."))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());
});

// Оптимизируем все картинки и делаем правильную загрузку
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([imagemin.optipng({
        optimizationLevel: 3,
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
      })
    ]))
    .pipe(gulp.dest("build/img"));
});

// Конвертируем изображения в формат webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img/webp"));
});

// Копируем файлы
gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

// Запускаем сервер
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/*.{png,jpg,svg}", gulp.series("images", "refresh"));
  gulp.watch("source/img/webp/*.webp", gulp.series("webp", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "html", "css", "js", "images", "webp")); // "copy"
gulp.task("start", gulp.series("build", "server"));
