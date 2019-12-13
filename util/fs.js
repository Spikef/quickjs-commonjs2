import * as os from 'os';

// https://github.com/TooTallNate/stat-mode/blob/master/src/index.ts
const S_IFMT = 61440;   /* 0170000 type of file */
const S_IFDIR = 16384;  /* 0040000 directory */
const S_IFREG = 32768;  /* 0100000 regular */

const fs = {};

fs.exists = function exists(path) {
    const [, err] = os.stat(path);
    return !err;
};

fs.stat = function stat(path) {
    const [stats, err] = os.stat(path);
    if (err) return null;

    return {
        ...stats,
        isFile() {
            return (stats.mode & S_IFMT) === S_IFREG;
        },
        isDirectory() {
            return (stats.mode & S_IFMT) === S_IFDIR;
        },
    };
};

fs.readFile = function readFile(path) {
    const [stats, err] = os.stat(path);
    if (err) throw new Error(`File is not exists: ${path}`);
    const buffer = new ArrayBuffer(stats.size);
    const fd = os.open(path);
    os.read(fd, buffer, 0, stats.size);
    os.close(fd);
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
};

export default fs;
