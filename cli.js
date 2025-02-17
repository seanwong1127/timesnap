#!/usr/bin/env node

/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2018-2019, Steve Tung
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const commander = require('commander');
const recorder = require('./index.js');
const packageInfo = require('./package.json');

commander
  .version(packageInfo.version, '-v, --version')
  .usage('<url> [options]')
  .option('-o, --output-directory <path>', 'Save to directory. (default: ./)')
  .option('-O, --output-pattern <pattern>', 'Save each file as a printf-style string (e.g. image-%03d.png)')
  .option('-R, --fps <frame rate>', 'Frames per second to capture (default: 60)', parseFloat)
  .option('-d, --duration <seconds>', 'Duration of capture, in seconds (default: 5)', parseFloat)
  .option('--frames <count>', 'Number of frames to capture', parseInt)
  .option('-S, --selector <selector>', 'CSS Selector of item to capture')
  .option('--output-stdout', 'Output images to stdout')
  .option('-V, --viewport <dimensions>', 'Viewport dimensions, in pixels (e.g. 800,600)', function (str) {
    var dims = str.split(',').map(function (d) { return parseInt(d); });
    return dims.length > 1 ? { width: dims[0], height: dims[1] } : { width: dims[0] };
  })
  .option('--transparent-background', 'Allow transparent backgrounds (for pngs)')
  .option('--round-to-even-width', 'Rounds capture width up to the nearest even number')
  .option('--round-to-even-height', 'Rounds capture height up to the nearest even number')
  .option('-s, --start <n seconds>', 'Runs code for n virtual seconds before saving any frames.', parseFloat, 0)
  .option('-x, --x-offset <pixels>', 'X offset of capture, in pixels', parseFloat, 0)
  .option('-y, --y-offset <pixels>', 'Y offset of capture, in pixels', parseFloat, 0)
  .option('-W, --width <pixels>', 'Width of capture, in pixels', parseInt)
  .option('-H, --height <pixels>', 'Height of capture, in pixels', parseInt)
  .option('-l, --left <pixels>', 'left edge of capture, in pixels. Equivalent to --x-offset', parseFloat)
  .option('-r, --right <pixels>', 'right edge of capture, in pixels', parseFloat)
  .option('-t, --top <pixels>', 'top edge of capture, in pixels. Equivalent to --y-offset', parseFloat)
  .option('-b, --bottom <pixels>', 'bottom edge of capture, in pixels', parseFloat)
  .option('--start-delay <n seconds>', 'Wait n real seconds after loading.', parseFloat, 0)
  .option('-u, --unrandomize [seed]', 'Overwrite Math.random() with a PRNG with up to 4 optional, comma-separated integer seeds')
  .option('-q, --quiet', 'Suppress console logging')
  .option('-L, --launch-arguments <arguments>', 'Custom launch arguments for Puppeteer browser', function (str) {
    // TODO: make a more sophisticated parser for options that can handle quote marks
    return str.split(' ');
  })
  .option('--no-headless', 'Chromium/Chrome runs in a window instead of headless mode')
  .option('--executable-path <path>', 'Uses Chromium/Chrome application at specified path for puppeteer')
  .parse(process.argv);

commander.url = commander.args[0] || 'index.html';

var processor;
if (commander.outputStdout) {
  process.stdout.on('error', function (err) {
    if (!commander.quiet) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    process.exit(1);
  });
  processor = function (buffer) {
    process.stdout.write(buffer);
  };
}

var config = Object.assign({}, commander, {
  logToStdErr: commander.outputStdout ? true : false,
  frameProcessor: processor
});

recorder(config);
// normally we need should close a stream after it is done but in this case, process.stdout should not be closed
