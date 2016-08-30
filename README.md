# gulp-phpipe

gulp-phpipe simply runs files through the PHP processor. This can be used to generate static HTML from PHP code or to do simple PHP templating. This uses your systems PHP binary and if you don't have one, this will not work. Since this is a gulp plugin and gulp works with transient file streams, the (quite possibly virtual) file contents are piped to the PHP process which has some implications:
* `__FILE__` is set to `-` in the executed code. This does not hold for files included from the _root_ file; see below
* `dirname(__FILE__)` will return `.` which stems from the file path being `-`
* `__DIR__` is set to the PHP process working directory which is set to the processed [Vinyl file's base path](https://github.com/gulpjs/vinyl) overwritten explicitly; see options

## Usage

### Basic Example

`source.php`
```php
<h1>Test</h1>
<div><?php echo "Hello World"; ?></div>
```

`Gulpfile.js`
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

This results in `compiled/source.html`
```html
<h1>Test</h1>
<div>Hello World</div>
```

### Working With Includes

`templates/base.php`
```php
<h1>Test</h1>
<?php include(__DIR__ . 'inner.php'); ?>
```

`templates/inner.php`
```php
<h2>This is included from <?php echo __FILE__; ?></h2>
```

`Gulpfile.js`
```javascript
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    phpipe = require('gulp-phpipe');

gulp.task('default', function () {
    gulp.src('templates/*.php')
        .pipe(phpipe())
        // If the glob used to gather the PHP files were "**/*.php", then the include would not
        // work unless the working directory was overwritten like this:
        //
        //.pipe(phpipe({
        //    cwd: 'templates',
        //}))
        .pipe(rename(function (path) {
            path.extname = ".html";
            return path;
        }))
        .pipe(gulp.dest('compiled'));
});

```

This results in `compiled/base.html
```html
<h1>Test</h1>
<h2>This is included from /path/to/current/gulp/dir/templates/inner.php</h2>
```

## Options
You can pass options to `gulp-phpipe(options)`

* `phpBin`: string - full path of the PHP binary you wish to use; this defaults to `php` which assumes that PHP is in your PATH
* `phpArgs`: string[] - array of additional arguments for the PHP process; defaults to`[]`
* `cwd`: string - the working directory of the PHP process; defaults to the `base` directory of the processed file
* `env`: object - overrides all current environment variables and runs PHP with only the environment variables set in this object; defaults to `null`

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
