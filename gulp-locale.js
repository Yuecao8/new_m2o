/**
 * gulp 插件
 * 用于语言翻译josn文件的合并压缩
 * Created by winjo
 */

'use strict';

const gutil = require('gulp-util');
const path = require('path');
const through = require('through2');
const File = require('vinyl');

const PLUGIN_NAME = 'gulp-locale';

function getFileName (pathName) {
    // return path.match(/(?:.*\/|)(.+)\.json$/)[1]
    return path.basename(pathName, '.json')
}

function camelCase(name) {
    return name.replace(/([\-]+(.))/g, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
    })
}

module.exports = function locale(opts) {
    let options = {
        // Defaults
        fileName: 'combined.js',
        export: 'window.translate',
    };

    options = Object.assign(options, opts);

    let firstFile = null;
    let merged = {};

    function parseAndMerge(file, env, cb) {
        let parsed;

        if (file.isNull()) {
            cb();
            return;
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, `${PLUGIN_NAME}: Streaming not supported!`));
            cb();
            return;
        }

        if (!firstFile) {
            firstFile = file;
        }

        try {
            parsed = JSON.parse(file.contents.toString('utf8'));
        } catch (err) {
            err.message = `Error while parsing ${file.path}: ${err.message}`;
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
        }

        try {
            let key = camelCase(getFileName(file.path));
            merged[key] = parsed;
        } catch (err) {
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
        }

        cb();
    }

    function endStream(cb) {
        if (!firstFile) {
            this.emit('end');
            cb();
            return;
        }

        let contents = JSON.stringify(merged);

        contents = `${options.export} = ${contents};`;

        const output = new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: path.join(firstFile.base, options.fileName),
            contents: new Buffer(contents),
        });

        this.push(output);
        cb();
    }

    return through.obj(parseAndMerge, endStream);
};
