import * as os from 'os';
import Module from './lib/module.js';

const [__filename] = os.realpath(scriptArgs[0]);
const module = new Module(__filename);

export default function require(id) {
    return module.require(id);
}
