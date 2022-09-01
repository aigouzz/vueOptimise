function isObject(obj) {
    return obj !== null && typeof obj == 'object';
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

const hasProto = '__proto__' in {}; 

function protoAugment(target, src, keys) {
    target.__proto__ = src;
}

function copyAugment(target, src, keys = []) {
    for(let i=0;i<keys.length;i++) {
        defs(target, keys[i], src[keys[i]]);
    }
}