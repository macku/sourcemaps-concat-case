const fs = require('fs');
const path = require('path');
const Concat = require('concat-with-sourcemaps');

const cases = [
    {
        input: [
            'fixtures/twoMapsWithTheSameSources/map1.js',
            'fixtures/twoMapsWithTheSameSources/map2.js',
        ],
        output: 'fixtures/twoMapsWithTheSameSources/output.js',
    },
];

const ROOT = path.resolve(__dirname, '..');

function beautifyJson (input) {
    return JSON.stringify(JSON.parse(input), null, '\t');
}

for (const {input, output} of cases) {
    const files = input.map(file => {
        const filepath = path.resolve(ROOT, file);

        return {
            filename: path.basename(file),
            filepath,
            content: fs.readFileSync(filepath).toString(),
            sourceMaps: fs.readFileSync(`${filepath}.map`).toString(),
        };
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
    function truncateSourceMapComment (content) {
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
    fs.writeFileSync(path.join(ROOT, sourceMapFilepath), beautifyJson(concat.sourceMap));

    console.log(`Generated and saved files to ${output}`);
    console.log('Navigate to https://sokra.github.io/source-map-visualization and D&D "output.js" and "output.js.map" files from the "dist" directory');
}
