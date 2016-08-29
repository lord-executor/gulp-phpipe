var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	through = require('through2'),
	Path = require('path'),
	PluginError = require('gulp-util').PluginError;

// consts
var PLUGIN_NAME = 'gulp-phpipe';

module.exports = () => {
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
			name = Path.basename(file.path, Path.extname(file.path)),
			phpProcess = spawn('php'),
			phpOut = [],
			phpErr = [];

		fileClone.path = Path.join(Path.dirname(file.path), name + '.html');

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
