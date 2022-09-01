/**
 * patch:
 * 新的vnode中有，旧的vnode中没有，就在旧的vnode中添加
 * 新的vnode中没有，旧的vnode中有，就在旧的vnode中删除
 * 都有，就以新的vnode为主，更新
 */
import { isDef, nodeOps, insert } from "./api";

export class VNode{
    constructor(
        tag = '',data, children=[], text='', elm, context, componentOptions, asyncFactory
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.fnContext = undefined;
        this.fnOptions = undefined;
        this.fnScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false; //是否静态结点
        this.isRootInsert = false;//是否根节点插入
        this.isComment = false; // 是否注释结点 
        this.isCloned = false;// 是否克隆结点
        this.isOnce = false; //是否有v-once指令
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncFolder = false;
    }
}

export function createEmptyVNode(text='') {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}

export function cloneVNode(vnode) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory,
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned;
}


//vnode/patch.js
export function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index ) {
    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;
    if(isDef(tag)) {
        vnode.elm = nodeOpts.createElement(tag, vnode);
        createChildren(vnode, children, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
    } else if(vnode.isComment) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
    } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
    }
    
}