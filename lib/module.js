import fs from '../util/fs.js';
import path from '../util/path.js';
import makeRequire from './require.js';

export default class Module {
    constructor(id) {
        this.id = id;
        this.filename = id;
        this.loaded = false;
        this.exports = {};
        this.children = [];
        this.parent = null;

        this.require = makeRequire.call(this);
    }

    compile() {
        const __filename = this.filename;
        const __dirname = path.dirname(__filename);

        let code = fs.readFile(__filename);
        if (path.extname(__filename).toLowerCase() === '.json') {
            code = 'module.exports=' + code;
        }
        const wrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
        wrapper.call(this, this.exports, this.require, this, __filename, __dirname);

        this.loaded = true;
    }
}
