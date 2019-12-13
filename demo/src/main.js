console.log('');
console.log(`__dirname: ${__dirname}`);
console.log(`__filename: ${__filename}`);
console.log('');
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log(`in main, a.done = ${a.done}, b.done = ${b.done}`);
