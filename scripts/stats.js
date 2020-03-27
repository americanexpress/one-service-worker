/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const fs = require('fs');
const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const chalk = require('chalk');

function filterExisting(baseDir = process.cwd()) {
  return function filterExistingOnly(filename) {
    return fs.existsSync(path.resolve(baseDir, filename));
  };
}

function mapFileSize(baseDir = process.cwd(), divisor = 1000) {
  return function getFileSizeFromBytes(filename) {
    const { size: byteSize } = fs.statSync(path.resolve(baseDir, filename));
    return byteSize / divisor;
  };
}

const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

const printFilesAndSize = files => {
  const sizes = files.filter(filterExisting()).map(mapFileSize());
  return sizes
    .map(
      (size, i) =>
        chalk`\t{white.bold |----- ${files[i]}}\n\t|\n\t| ${chalk
          .bgRgb(0, 0, 0)
          // start at red (0), stop at greenish aqua (180)
          .hsl(clamp(90 - size + 15, 0, 180), 100, 50)
          .bold(`\t${size}\t`)} {green kb}`,
    )
    .join('\n\t|\n');
};

module.exports = function printOutFiles(files) {
  const flatFiles = files.reduce((array, nextPath) => {
    if (fs.existsSync(nextPath)) {
      const stats = fs.statSync(nextPath);
      if (stats.isDirectory()) {
        const dir = fs.readdirSync(nextPath).map(baseFilePath => path.join(nextPath, baseFilePath));
        dir.forEach(pathName => array.push(pathName));
      } else array.push(nextPath);
    }
    return array;
  }, []);

  const output = [
    chalk`\n{bgCyan   {black.bold Files}  } (${flatFiles.length} total)

{bgCyan   {bold.black /}\t}| (files to be published)

\t|-----------------------
\t|
${printFilesAndSize(flatFiles)}
\t|
\t------------------------`,
  ];

  process.stdout.write(`${output.join()}\n`);
};
