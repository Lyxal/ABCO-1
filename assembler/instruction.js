/*
  instruction.js
  ABCO-1 assembler instruction handler
  copyright (c) 2021 sporeball
  MIT license
*/

import * as Util from './util.js';
import { LineException } from './util.js';

export function prep (contents) {
  global.lineNo = 0;

  for (const line of contents) {
    global.lineNo++;
    if (line === '' || line.endsWith(':')) {
      continue;
    }

    const isMacro = !line.match(/^\d+(,| )|^[^, ]+?,/); // aaaaaa
    validate(line, isMacro);
  }
}

/**
 * validate an instruction
 * @param {String} instruction
 * @param {boolean} isMacro
 */
export function validate (instruction, isMacro) {
  // edge case
  if (instruction === 'abcout') {
    throw new LineException('wrong number of arguments (0 given)');
  }

  let args = instruction.split(' ');
  if (!Util.isSeparated(args, isMacro)) {
    throw new LineException('arguments must be comma-separated');
  }
  args = args.map(x => x.replace(',', ''));

  // validate the arguments that are already numbers
  for (const arg of args.filter(arg => isFinite(arg))) {
    if (arg > 32767) {
      throw new LineException('argument too big');
    } else if (arg < 0) {
      throw new LineException('argument cannot be negative');
    }
  }

  if (isMacro) {
    // name validation
    const name = args[0];
    if (!name.match(/[a-z_]([a-z0-9_]+)?/)) {
      throw new LineException(`invalid macro name "${name}"`);
    }
    if (global.macros[name] === undefined) {
      throw new LineException(`macro "${name}" is undefined`);
    }

    // arguments validation
    if (args.length - 1 !== global.macros[name].params) {
      throw new LineException(`wrong number of arguments (${args.length - 1} given)`);
    }
  } else {
    if (args.length !== 2 && args.length !== 3) {
      throw new LineException(`wrong number of arguments (${args.length} given)`);
    }

    const [A, B, C] = args;
    // A and B validation
    if (isNaN(A) || isNaN(B)) {
      throw new LineException('arguments A and B must be integers');
    }

    // C validation
    if (isFinite(C)) {
      if (C % 6 !== 0) {
        throw new LineException('invalid value for argument C');
      }
    } else {
      if (C !== undefined && global.labels[C] === undefined) {
        throw new LineException(`label "${C}" is undefined`);
      }
    }
  }
}
