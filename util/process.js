import * as os from 'os';

const process = {};

process.env = {};

process.cwd = function cwd() {
    return os.getcwd()[0];
};

export default process;
