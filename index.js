var spawn = require('child_process').spawn,
	extend = require('util')._extend,
	through = require('through2'),
	PluginError = require('gulp-util').PluginError;

// consts
var PLUGIN_NAME = 'gulp-phpipe';

module.exports = (options) => {
	options = Object.assign({
		phpBin: 'php',
		phpArgs: [],
		env: null,
		cwd: null,
	}, options);

	return through.obj(function (file, encoding, callback) {
		if (file.isNull()) {
			// nothing to do
			return callback(null, file);
		}

		if (file.isStream()) {
			// file.contents is a Stream - https://nodejs.org/api/stream.html
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
			return;
		}

		var fileClone = file.clone(),
			phpProcess = spawn(options.phpBin, options.phpArgs, {
				env: options.env,
				cwd: options.cwd || file.base,
			}),
			phpOut = [],
			phpErr = [];

		phpProcess.stdout.on('data', (data) => {
			phpOut.push(data);
		});

		phpProcess.stderr.on('data', (data) => {
			phpErr.push(data);
		});

		phpProcess.on('close', (exitCode) => {
			if (exitCode !== 0) {
				this.emit('error', new PluginError(PLUGIN_NAME, ['Error executing PHP', Buffer.concat(phpOut).toString()].join('\n')));
			} else if (phpErr.length > 0) {
				this.emit('error', new PluginError(PLUGIN_NAME, ['PHP Error(s) during transform of ' + file.path, Buffer.concat(phpErr).toString()].join('\n')));
			} else {
				fileClone.contents = Buffer.concat(phpOut);
				callback(null, fileClone);
			}
		});

		file.pipe(phpProcess.stdin);
	});
};
