const fs = require('fs');
const path = require('path');
const Concat = require('concat-with-sourcemaps');
const {merge: inlineSourceMaps} = require('merge-source-maps/lib/index');

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

for (const fileMeta of files) {
    concat.add(fileMeta.filename, fileMeta.content, fileMeta.sourceMaps);
}

// Last step, save the content
fs.writeFileSync(path.join(ROOT, output), concat.content);

// Save the sourcemaps
fs.writeFileSync(path.join(ROOT, `${output}.map`), concat.sourceMap);

console.log(`Generated and saved files to ${output}`);
