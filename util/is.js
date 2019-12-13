export const string = function isString(str) {
    return typeof str === 'string';
};

export const object = function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};
