/**
 * 常用变量
 * @param 
 * @returns 
 */
import { VNode } from './VNode';
import {_Set} from '../util/env';

const _toString = Object.prototype.toString;

export const SSR_ATTR = 'data-server-rendered';

export function isObject(obj) {
    return obj !== null && typeof obj == 'object';
}

export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isNative(ctor) {
    return typeof ctor === 'function' && /native code/.test(ctor.toString());
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

let seenObjects = new _Set();
export function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}

function _traverse(val, seenObjects) {
    let i, keys;
    let isA = Array.isArray(val);
    if((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
        return;
    }
    if(val.__ob__) {
        let depId = val.__ob__.dep.id;
        if(seenObjects.has(depId)) {
            return;
        }
        seenObjects.add(depId);
    }
    if(isA) {
        i = val.length;
        while(i -- && i >= 0) {
            _traverse(val[i], seenObjects);
        }
    } else {
        keys = Object.keys(val);
        i = keys.length;
        while(i -- && i >= 0) {
            _traverse(val[keys[i]], seenObjects);
        }
    }
}

export const noop = function () {}