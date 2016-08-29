# gulp-phpipe

gulp-phpipe simply runs files through the PHP processor. This can be used to generate static HTML from PHP code or to do simple PHP templating. This uses your systems PHP binary and if you don't have one, this will not work.

## Usage

source.php
```php
<h1>Test</h1>
<div><?php echo "Hello World"; ?></div>
```

Gulpfile.js
```javascript
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    phpipe = require('gulp-phpipe');

gulp.task('default', function () {
    gulp.src('*.php')
        .pipe(phpipe())
        .pipe(rename(function (path) {
            path.extname = ".html";
            return path;
        }))
        .pipe(gulp.dest('compiled'));
});

```

This results in source.html
```html
<h1>Test</h1>
<div>Hello World</div>
```

## Options
You can pass options to `gulp-phpipe(options)`

* `phpBin` - full path of the PHP binary you wish to use; this defaults to `php` which assumes that PHP is in your PATH
* `phpArgs` - array of additional arguments for the PHP process; defaults to`[]`

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
