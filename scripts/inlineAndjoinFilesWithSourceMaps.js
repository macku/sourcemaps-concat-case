const fs = require('fs');
const path = require('path');
const Concat = require('concat-with-sourcemaps');
const {merge: inlineSourceMaps} = require('merge-source-maps/lib/index');

/**
 * Inlines the sources into source map files, and then joins two source maps into a single one
 */

const input = [
    './dist/foo-module.js',
    './dist/my-module.js',
];
const output = './dist/output.js';


const ROOT = path.resolve(__dirname, '..');

const files = input.map(file => {
    const filepath = path.resolve(ROOT, file);

    return {
        filename: path.basename(file),
        filepath,
        content: fs.readFileSync(filepath).toString(),
        sourceMaps: fs.readFileSync(`${filepath}.map`).toString(),
    };
});

// First, inline the sourcemaps since TS doesn't do that
console.log('Inline source maps...');
inlineSourceMaps(files.map(({filepath}) => ({src: filepath, dest: filepath})), {
    inlineSources: true,
});

// Next, reload the content of sourcemaps files
files.forEach(fileMeta => {
    fileMeta.sourceMaps = fs.readFileSync(`${fileMeta.filepath}.map`).toString();
});

// Now, merge the files into singe line
console.log('Merge modules into single file...');
const concat = new Concat(true, path.basename(output), '\n\n');

const JS_SOURCE_MAP_COMMENT_REGEXP = /^\/\/# sourceMappingURL=.+$/;

/**
 * Naively remove the sourceMappingURL comment
 * @param content {string}
 * @returns {string}
 */
function truncateSourceMapComment(content) {
    const lines = content.trim().split('\n');
    const lastLine = lines.pop();

    if (!lastLine.trim().match(JS_SOURCE_MAP_COMMENT_REGEXP)) {
        // Revert the removal
        lines.push(lastLine);
    }

    return lines.join('\n');
}

for (const fileMeta of files) {
    concat.add(fileMeta.filename, truncateSourceMapComment(fileMeta.content), fileMeta.sourceMaps);
}

// Push the source map comment
const sourceMapFilepath = `${output}.map`;
concat.add(null, `//# sourceMappingURL=${path.basename(sourceMapFilepath)}`);

// Last step, save the content
fs.writeFileSync(path.join(ROOT, output), concat.content);

// Save the sourcemaps
fs.writeFileSync(path.join(ROOT, sourceMapFilepath), concat.sourceMap);

console.log(`Generated and saved files to ${output}`);
console.log('Navigate to https://sokra.github.io/source-map-visualization and D&D "output.js" and "output.js.map" files from the "dist" directory')
