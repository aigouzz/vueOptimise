import { createElm } from "./VNode";

/**
 * vnode常量
 * @param 
 * @returns 
 */
 let namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
};

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

export function isUnDef(val) {
    return val === undefined || val === null;
}

/**
 * vnode相关方法
 * @param {string} tagName 
 * @param {VNode} vnode 
 * @returns 
 */
function createElement$1(tagName, vnode) {
    let elm = document.createElement(tagName);
    if(tagName !== 'select') {
        return elm;
    }
    if(vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
        elm.setAttribute('multiple', 'multiple');
    }
    return elm;
}

function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
    return document.createTextNode(text)
}

function createComment (text) {
    return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
    node.removeChild(child);
}

function appendChild (node, child) {
    node.appendChild(child);
}

function parentNode (node) {
    return node.parentNode
}

function nextSibling (node) {
    return node.nextSibling
}

function tagName (node) {
    return node.tagName
}

function setTextContent (node, text) {
    node.textContent = text;
}

function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
}

export const nodeOps = Object.freeze({
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
});

export function insert(parent, elm, ref) {
    if(isDef(parent)) {
        if(isDef(ref) && nodeOps.parentNode(parent, ref)) {
            nodeOps.insertBefore(parent, elm, ref);
        } else {
            nodeOps.appendChild(parent, elm);
        }
    }
}

export function checkDuplicateKeys(children) {
    let seenKeys = {};
    for(let i=0;i<children.length;i++ ) {
        let vnode = children[i];
        let key = vnode.key;
        if(isDef(key)) {
            if(seenKeys[key]) {
                console.error('duplicate key detected:' + key);
            } else {
                seenKeys[key] = true;
            }
        }
    }
}

export function createChildren(vnode, children, insertedVnodeQueue) {
    if(Array.isArray(children)) {
        checkDuplicateKeys(children);
    }
    for(let i=0;i<children.length;i++) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
    }
}

export function sameVnode(a, b) {
    return (
        a.key === b.key && 
        a.asyncFactory === b.asyncFactory && (
            (
                a.tag === b.tag && 
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b)
            ) || (
                a.isAsyncPlaceholder && 
                isUndef(b.asyncFactory.error)
            )
        )
    );
}
function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
}

export function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
}