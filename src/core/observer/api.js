/**
 * 常用变量
 * @param 
 * @returns 
 */

const _toString = Object.prototype.toString;

export const SSR_ATTR = 'data-server-rendered';

export function isObject(obj) {
    return obj !== null && typeof obj == 'object';
}

export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export const hasProto = '__proto__' in {};

export function protoAugment(target, src, keys) {
    target.__proto__ = src;
}

export function copyAugment(target, src, keys = []) {
    for(let i=0;i<keys.length;i++) {
        defs(target, keys[i], src[keys[i]]);
    }
}

export function isDef(tag) {
    return tag !== undefined && tag !== null;
}

export function isUndef(val) {
    return val === undefined || val === null;
}

export function isPrimitive(value) {
    return (
        typeof value === 'string' || typeof value === 'number' || 
        typeof value === 'boolean' || typeof value === 'symbol'
    );
}

export function isRegExp(val) {
    return typeof val === 'object' && _toString.call(val).indexOf('RegExp') > -1;
}