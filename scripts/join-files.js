const fs = require('fs');
const path = require('path');
const Concat = require('concat-with-sourcemaps');

const ROOT = path.resolve(__dirname, '..');
const concat = new Concat(true, 'output.js', '\n\n');

const files = [
    'foo-module.js',
    'my-module.js',
].map(file => ({
    filename: file,
    content: fs.readFileSync(path.resolve(ROOT, `./dist/${file}`)),
    sourceMaps: fs.readFileSync(path.resolve(ROOT, `./dist/${file}.map`)),
}));

for (const fileMeta of files) {
    concat.add(fileMeta.filename, fileMeta.content, fileMeta.sourceMaps);
}

// Save the content
fs.writeFileSync(path.join(ROOT, './dist/output.js'), concat.content);

// Save the sourcemaps
fs.writeFileSync(path.join(ROOT, './dist/output.js.map'), concat.sourceMap);