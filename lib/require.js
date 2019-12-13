import * as os from 'os';
import * as std from 'std';

import fs from '../util/fs.js';
import path from '../util/path.js';
import Module from './module.js';

const cache = {};
const route = {};

const coreModules = { os, std };
const extensions = ['', '.js', '.json', '.node'];
const NODE_MODULES = 'node_modules';
const REGEXP_RELATIVE = /^\.{0,2}\//;

// 1. If X is a file, load X as JavaScript text.  STOP
// 2. If X.js is a file, load X.js as JavaScript text.  STOP
// 3. If X.json is a file, parse X.json to a JavaScript Object.  STOP
// 4. If X.node is a file, load X.node as binary addon.  STOP
const loadAsFile = function loadAsFile(x) {
    let y;
    let stats;

    for (let i = 0; i < extensions.length; i++) {
        y = `${x}${extensions[i]}`;
        stats = fs.stat(y);
        if (stats && stats.isFile()) return y;
    }
};

// 1. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
// 2. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
// 3. If X/index.node is a file, load X/index.node as binary addon.  STOP
const loadIndex = function loadIndex(x) {
    let y;
    let stats;

    for (let i = 1; i < extensions.length; i++) {
        y = `${x}/index${extensions[i]}`;
        stats = fs.stat(y);
        if (stats && stats.isFile()) return y;
    }
};

// 1. If X/package.json is a file,
//     a. Parse X/package.json, and look for "main" field.
//     b. If "main" is a falsy value, GOTO 2.
//     c. let M = X + (json main field)
//     d. LOAD_AS_FILE(M)
//     e. LOAD_INDEX(M)
//     f. LOAD_INDEX(X) DEPRECATED
//     g. THROW "not found"
// 2. LOAD_INDEX(X)
const loadAsDirectory = function loadAsDirectory(x) {
    let y;
    let stats;

    y = `${x}/package.json`;
    stats = fs.stat(y);
    if (stats && stats.isFile()) {
        try {
            const pkg = JSON.parse(fs.readFile(y));
            if (!pkg.main) return loadIndex(x);
            const m = path.join(x, pkg.main);
            return loadAsFile(m) || loadIndex(m);
        } catch (e) {
            return loadIndex(x);
        }
    }

    return loadIndex(x);
};

// 1. let DIRS = NODE_MODULES_PATHS(START)
// 2. for each DIR in DIRS:
// a. LOAD_AS_FILE(DIR/X)
// b. LOAD_AS_DIRECTORY(DIR/X)
const loadNodeModules = function loadNodeModules(x, start) {
    let filename;
    let dirs = nodeModulesPaths(start);
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        filename = loadAsFile(path.join(dir, x));
        if (filename) return filename;
        filename = loadAsDirectory(path.join(dir, x));
        if (filename) return filename;
    }
};

// NODE_MODULES_PATHS(START)
// 1. let PARTS = path split(START)
// 2. let I = count of PARTS - 1
// 3. let DIRS = [GLOBAL_FOLDERS]
// 4. while I >= 0,
//     a. if PARTS[I] = "node_modules" CONTINUE
//     b. DIR = path join(PARTS[0 .. I] + "node_modules")
//     c. DIRS = DIRS + DIR
//     d. let I = I - 1
// 5. return DIRS
const nodeModulesPaths = function nodeModulesPaths(start) {
    const parts = start.split(/[\\\/]+/);
    let i = parts.length - 1;
    const dirs = []; // ignore GLOBAL_FOLDERS
    while (i >= 0) {
        if (parts[i] === NODE_MODULES) {
            i--;
            continue;
        }
        let dir = path.join.apply(path, [...parts.slice(0, i + 1), NODE_MODULES]);
        dirs.push(dir);
        i--;
    }
    return dirs;
};

export default function makeRequire() {
    const context = this;
    const dirname = path.dirname(context.filename);

    if (!route[dirname]) {
        route[dirname] = {};
    }

    function resolve(request) {
        if (route[dirname][request]) {
            return route[dirname][request];
        }

        if (coreModules[request]) {
            return request;
        }

        let filename;
        if (REGEXP_RELATIVE.test(request)) {
            let absPath = path.resolve(dirname, request);
            filename = loadAsFile(absPath) || loadAsDirectory(absPath);
        } else {
            filename = loadNodeModules(request, dirname);
        }

        if (!filename) {
            throw new Error(`Can not find module '${request}'`);
        }

        return filename;
    }

    // require(X) from module at path Y
    // 1. If X is a core module,
    //     a. return the core module
    // b. STOP
    // 2. If X begins with '/'
    //     a. set Y to be the filesystem root
    // 3. If X begins with './' or '/' or '../'
    // a. LOAD_AS_FILE(Y + X)
    // b. LOAD_AS_DIRECTORY(Y + X)
    // 4. LOAD_NODE_MODULES(X, dirname(Y))
    // 5. THROW "not found"
    function require(id) {
        const filename = resolve(id);

        let module;
        if (coreModules[filename]) {
            return coreModules[filename];
        } else if (cache[filename]) {
            module = cache[filename];
            if (!~context.children.indexOf(module)) {
                context.children.push(module);
            }
        } else {
            module = new Module(filename);
            (module.parent = context).children.push(module);
            (cache[filename] = module).compile();
        }

        return module.exports;
    }

    require.cache = cache;
    require.resolve = resolve;

    return require;
}
