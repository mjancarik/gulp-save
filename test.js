'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var through = require('through2');
var save = require('./');

function transform () {
	return through.obj(function (file, enc, cb) {
		file.contents = new Buffer('two unicorns');
		this.push(file);
		cb();
	});
}

function empty () {
	return through.obj(function (file, enc, cb) {
		this.push(file);
		cb();
	});
}

it('should cache stream and restore it', function (cb) {
	var startCache = save('test');
	var testTransform = transform();
	var testEmpty = empty();
	var restoreCache = save.restore('test');

	startCache.pipe(testTransform)
						.pipe(restoreCache)
						.pipe(testEmpty);

	testTransform.on('data', function (file) {
		assert.equal(file.contents.toString(), 'two unicorns');
	});

	testEmpty.on('data', function (file) {
		assert.equal(file.contents.toString(), 'unicorns');
	});

	testEmpty.on('end', cb);

	startCache.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startCache.end();
});
