/**
 * patch:
 * 新的vnode中有，旧的vnode中没有，就在旧的vnode中添加
 * 新的vnode中没有，旧的vnode中有，就在旧的vnode中删除
 * 都有，就以新的vnode为主，更新
 */
import { isDef, isUndef, SSR_ATTR, isRegExp, traverse } from "./api";

export class VNode{
    constructor(
        tag = '',data, children=[], text='', elm, context, componentOptions, asyncFactory
    ) {
        this.tag = tag; //当前节点标签名
        this.data = data;//节点对应对象，包含一些数据信息，VNodeData类型
        this.children = children;//节点子节点，数组
        this.text = text;//节点文本
        this.elm = elm;//节点对应的真是dom节点
        this.ns = undefined;//节点名字空间
        this.context = context;//组件节点对应的vue实例
        this.fnContext = undefined;//函数式组件对应的vue实例
        this.fnOptions = undefined;//函数式组件对应实例的options对象
        this.fnScopeId = undefined;//函数式组件对应vue实例的scopeid
        this.key = data && data.key;//节点key属性，节点标志，用以优化
        this.componentOptions = componentOptions;//组件options选项
        this.componentInstance = undefined;//对应vue组件的实例
        this.parent = undefined;//节点的父节点
        this.raw = false;//是原生html还是普通文本，innerHTML的时候是true，textContent是false
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

let ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

function registerRef(vnode, isRemoval) {
    let key = vnode.data.ref;
    if(!isDef(key)) return;

    let vm = vnode.context;
    let ref = vnode.componentInstance || vnode.elm;
    let refs = ref.$refs;
    if(isRemoval) {
        if(Array.isArray(refs[key])) {
            remove(refs[key], ref);
        } else if(refs[key] === ref) {
            refs[key] = undefined;
        }
    } else {
        if(vnode.data.refInFor) {
            if(!Array.isArray(refs[key])) {
                refs[key] = [ref];
            } else if (refs[key].indexOf(ref) < 0) {
                refs[key].push(ref);
            }
        } else {
            refs[key] = ref;
        }
    }
}

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

const nodeOps = Object.freeze({
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

function insert(parent, elm, ref) {
    if(isDef(parent)) {
        if(isDef(ref) && nodeOps.parentNode(parent, ref)) {
            nodeOps.insertBefore(parent, elm, ref);
        } else {
            nodeOps.appendChild(parent, elm);
        }
    }
}

/**
 * Virtual DOM patching algorithm
 */
let emptyNode = new VNode('', {}, []);
let hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode(a, b) {
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

function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
    }
    return map
}



function createEmptyVNode(text='') {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}

function cloneVNode(vnode) {
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

function removeNode(el) {
    const parent = nodeOps.parentNode(el);
    if(isDef(parent)) {
        nodeOps.removeChild(parent, el);
    }
}


export function createPatchFunction(backend) {
    let cbs = {};
    let modules = backend.modules;
    
    for (let i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            if (isDef(modules[j][hooks[i]])) {
                cbs[hooks[i]].push(modules[j][hooks[i]]);
            }
        }
    }

    let creatingElmInVPre = 0;
    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index ) {
        if(isDef(vnode.elm) && isDef(ownerArray)) {
            vnode = ownerArray[index] = cloneVNode(vnode);
        }
        vnode.isRootInsert = !nested;
        if(createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
            return;
        }
        
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

    function checkDuplicateKeys(children) {
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

    function createChildren(vnode, children, insertedVnodeQueue) {
        if(Array.isArray(children)) {
            checkDuplicateKeys(children);
        }
        for(let i=0;i<children.length;i++) {
            createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
    }

    function findIdxInOld (node, oldCh, start, end) {
        for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
        }
    }

    function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
        let i = vnode.data;
        if(isDef(i)) {
            let isReactivated = isDef(vnode.componentInsurance) && i.keepAlive;
            if(isDef(i=i.hook) && isDef(i=i.init)) {
                i(vnode, false); //hydrating
            }
            if(isDef(vnode.componentInsurance)) {
                initComponent(vnode, insertedVnodeQueue);
                insert(parentElm, vnode.elm, refElm);
                if(isReactivated) {
                    reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                }
                return true;
            }
        }
    }
    function initComponent(vnode, insertedVnodeQueue) {
        if(isDef(vnode.data.pendingInsert)) {
            insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
            vnode.data.pendingInsert = null;
        }
        vnode.elm = vnode.componentInstance.$el;
        if(isPatchable(vnode)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
            setScope(vnode);
        } else {
            registerRef(vnode);
            insertedVnodeQueue.push(vnode);
        }
    }

    function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
        let i;
        let innerNode = vnode;
        while(innerNode.componentInstance) {
            innerNode = innerNode.componentInstance._vnode;
            if(isDef(i = innerNode.data) && isDef(i=i.transition)) {
                for(i = 0;i < cbs.activate.length;i ++) {
                    cbs.activate[i](emptyNode, innerNode);
                }
                insertedVnodeQueue.push(innerNode);
                break;
            }
        }
        insert(parentElm, vnode.elm, refElm);
    }

    function isPatchable (vnode) {
        while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
        }
        return isDef(vnode.tag)
    }

    function invokeCreateHooks(vnode, insertedVnodeQueue) {
        for(let i$i=0;i$i<cbs.create.length;i$i++) {
            cbs.create[i$i](emptyNode, vnode);
        }
        let i = vnode.data.hook;
        if(isDef(i)) {
            if(isDef(i.create)) {
                i.create(emptyNode, vnode);
            }
            if(isDef(i.insert)) {
                insertedVnodeQueue.push(vnode);
            }
        }
    }

    function setScope(vnode) {
        let i;
        if(isDef(i = vnode.fnScopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
        } else {
            let ancestor = vnode;
            while(ancestor) {
                if(isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                    nodeOps.setStyleScope(vnode.elm, i);
                }
                ancestor = ancestor.parent;
            }
        }
    }

    /**
     * 更新子节点
     * 1：创建子节点
     *  若newch中某个子节点在oldch中找不到与之相同的子节点，说明newch中这个子节点之前没有
     * 需要此次新增节点，创建子节点
     * 2：删除子节点
     *  若newch中每个子节点都循环之后，而oldch中还有未处理的子节点，说明oldch中这些未处理子节点
     * 需要被废弃，那么就删除这些未处理的子节点
     * 3：移动子节点
     *  若newch中某个子节点在oldch中找到与之相同的子节点，但是位置不同，说明此次变化需要调整
     * 该子节点的位置，就以newch中子节点位置为基准，调整oldch中该节点位置，使之与newch中
     * 位置相同
     * 4：更新节点
     *  若newch中某个子节点在oldch中找到与之相同子节点，且位置也相同，则更新oldch中该节点
     * 使之与newch里的该节点相同
     * @param {object} parentElm 
     * @param {array} oldCh 
     * @param {array} newCh 
     * @param {array} insertedVnodeQueue 
     * @param {boolean} removeOnly 
     */
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx,idxInOld,vnodeToMove,refElm;

        let canMove = !removeOnly;
        checkDuplicateKeys(newCh);

        while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if(isUndef(oldStartVnode)) {
                oldStartVnode = oldCh[++oldStartIdx];
            } else if(isUndef(oldEndVnode)) {
                oldEndVnode = oldCh[--oldEndIdx];
            } else if(sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if(sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if(sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if(sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, nodeOps.nextSibling(oldStartVnode.elm));
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if(isUndef(oldKeyToIdx)) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : 
                findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                if(isUndef(idxInOld)) {
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                } else {
                    vnodeToMove = oldCh[idxInOld];
                    if(sameVnode(vnodeToMove, newStartVnode)) {
                        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                        oldCh[idxInOld] = undefined;
                        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                    } else {
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
        if(oldStartIdx > oldEndIdx) {
            refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        } else if(newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
     }
    /**
     * patch:
     * 如果都是静态节点，则无需对比，直接略过
     * 如果vnode是文本节点，那么只需要看oldvnode是否也是文本节点，如果是，比较文本
     * 如果oldvnode不是文本节点，那么不论他是什么，直接调用setTextNode方法变成文本节点，
     * 且内容一致即可
     * 如果Vnode是元素节点：
     *      节点包含子节点：旧节点也包含子节点，就递归对比更新子节点；
     *                      旧节点不包含子节点，这个节点可能是空节点或者文本节点，如果旧节点
     *                      是空节点，就把新节点子节点创建一份插入到旧节点，
     *                      如果是文本节点，把文本清空，然后把新的节点子节点创建一份插入到旧节点
     *      节点不包含子节点：不包含子节点，同时也不是文本节点，那就说明是个空节点，
     *                      不管旧节点之前里面有啥，直接清空即可
     */

    function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
        if(oldVnode === vnode) {
            return;
        }
        const elm = vnode.elm = oldVnode.elm;
        if(vnode.isStatic && oldVnode.isStatic && vnode.key === oldVnode.key && (vnode.isCloned || vnode.isOnce)) {
            return;
        }
        const oldCh = oldVnode.children;
        const ch = vnode.children;
        if(isUndef(vnode.text)) {
            if(isDef(oldCh) && isDef(ch)) {
                if(oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
            } else if(isDef(ch)) {
                if(isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            } else if(isDef(oldCh)) {
                removeVnodes(elm, 0, oldCh.length - 1);
            } else if(isDef(oldVnode.text)) {
                nodeOps.setTextContent(elm, '');
            }
        } else if(oldVnode.text !== vnode.text) {
            nodeOps.setTextContent(elm, vnode.text);
        }
    }

    function invokeDestroyHook(vnode) {
        let i,j;
        let data = vnode.data;
        if(isDef(data)) {
            if(isDef(i = data.hook) && isDef(i = i.destroy)) {
                i(vnode);
            }
            for(i = 0;i < cbs.destroy.length;i ++) {
                cbs.destroy[i](vnode);
            }
        }
        if(isDef(i = vnode.children)) {
            for(j = 0;j < vnode.children.length;j ++) {
                invokeDestroyHook(vnode.children[j]);
            }
        }
    }

    function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for(;startIdx<=endIdx; ++startIdx) {
            createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
        }
    }
    
    function removeVnodes(vnodes, startIdx, endIdx) {
        for(;startIdx<=endIdx;++startIdx) {
            let chnode = vnodes[startIdx];
            if(isDef(chnode)) {
                if(isDef(chnode.tag)) {
                    removeAndInvokeRemoveHook(chnode);
                    invokeDestroyHook(chnode);
                } else {
                    removeNode(chnode.elm);
                }
            }
        }
    }
    
    function removeAndInvokeRemoveHook(vnode, rm) {
        if(isDef(rm) || isDef(vnode.data)) {
            let i;
            let listeners = cbs.remove.length + 1;
            if(isDef(rm)) {
                rm.listeners += listeners;
            } else {
                rm = createRmCb(vnode.elm, listeners);
            }

            if(isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                removeAndInvokeRemoveHook(i, rm);
            }

            for(i = 0;i < cbs.remove.length;i ++) {
                cbs.remove[i](vnode, rm);
            }
            if(isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                i(vnode, rm);
            } else {
                rm();
            }
        }  else {
            removeNode(vnode.elm);
        }
    }

    function createRmCb (childElm, listeners) {
        function remove$$1 () {
          if (--remove$$1.listeners === 0) {
            removeNode(childElm);
          }
        }
        remove$$1.listeners = listeners;
        return remove$$1
    }

    let hydrationBailed = false;
    let isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');
    function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
        let i;
        let tag = vnode.tag;
        let data = vnode.data;
        let children = vnode.children;
        inVPre = inVPre || (data && data.pre);
        vnode.elm = elm;

        if(vnode.isComment && isDef(vnode.asyncFactory)) {
            vnode.isAsyncPlaceholder = true;
            return true;
        }
        if(!assertNodeMatch(elm, vnode, inVPre)) {
            return false;
        }

        if(isDef(data)) {
            if(isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode, true);
            }
            if(isDef(i = vnode.componentInstance)) {
                initComponent(vnode, insertedVnodeQueue);
                return true;
            }
        }
        if(isDef(tag)) {
            if(isDef(children)) {
                if(!elm.hasChildNodes) {
                    createChildren(vnode, children, insertedVnodeQueue);
                } else {
                    if(isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
                        if(i !== elm.innerHTML) {
                            if(typeof console && !hydrationBailed) {
                                hydrationBailed = true;
                                console.warn('Parent: ', elm);
                                console.warn('server innerHTML: ', i);
                                console.warn('client innerHTML: ', elm.innerHTML);
                            }
                            return false;
                        }
                    } else {
                        let childrenMatch = true;
                        let childNode = elm.firstChild;
                        for(let i$i = 0;i$i < children.length;i$i ++) {
                            if(!childNode ||!hydrate(childNode, children[i$i], insertedVnodeQueue, inVPre)) {
                                childrenMatch = false;
                                break;
                            }
                            childNode = childNode.nextSibling;
                        }
                        if(!childrenMatch || childNode) {
                            if(typeof console && !hydrationBailed) {
                                hydrationBailed = true;
                                console.warn('Parent: ', elm);
                                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                            }
                            return false;
                        }
                    }
                }
            }
            if(isDef(data)) {
                let fullInvoke = false;
                for(let key in data) {
                    if(!isRenderedModule(key)) {
                        fullInvoke = true;
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                        break;
                    }
                }
                if(!fullInvoke && data['class']) {
                    traverse(data['class']);
                }
            }
        }
    }

    function assertNodeMatch (node, vnode, inVPre) {
        if (isDef(vnode.tag)) {
          return vnode.tag.indexOf('vue-component') === 0 || (
            !isUnknownElement$$1(vnode, inVPre) &&
            vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
          )
        } else {
          return node.nodeType === (vnode.isComment ? 8 : 3)
        }
    }
    function isUnknownElement$$1 (vnode, inVPre) {
        return (
            !inVPre &&
            !vnode.ns &&
            !(
            config.ignoredElements.length &&
            config.ignoredElements.some(function (ignore) {
                return isRegExp(ignore)
                ? ignore.test(vnode.tag)
                : ignore === vnode.tag
            })
            ) &&
            config.isUnknownElement(vnode.tag)
        )
    }

    return function patch(oldVnode, vnode, hydrating, removeOnly) {
        if(isUndef(vnode)) {
            if(isDef(oldVnode)) {
                invokeDestroyHook(oldVnode);
                return;
            }
        }
        let isInitialPatch = false;
        let insertedVnodeQueue = [];

        if(isUndef(oldVnode)) {
            isInitialPatch = true;
            createElm(vnode, insertedVnodeQueue);
        } else {
            let isRealElement = isDef(oldVnode.nodeType);
            if(!isRealElement && sameVnode(oldVnode, vnode)) {
                patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
            } else {
                if(isRealElement) {
                    if(oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                        oldVnode.removeAttribute(SSR_ATTR);
                        hydrating = true;
                    }
                    if(hydrating) {
                        if(hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                            invokeInsertHook(vnode, insertedVnodeQueue, true);
                            return oldVnode;
                        } else {
                            console.warn(
                                'The client-side rendered virtual DOM tree is not matching ' +
                            'server-rendered content. This is likely caused by incorrect ' +
                            'HTML markup, for example nesting block-level elements inside ' +
                            '<p>, or missing <tbody>. Bailing hydration and performing ' +
                            'full client-side render.'
                            );
                        }
                    }
                    oldVnode = emptyNodeAt(oldVnode);
                }
                let oldElm = oldVnode.elm;
                let parentElm = nodeOps.parentNode(oldElm);
                createElm(
                    vnode,
                    insertedVnodeQueue,
                    // extremely rare edge case: do not insert if old element is in a
                    // leaving transition. Only happens when combining transition +
                    // keep-alive + HOCs. (#4590)
                    oldElm._leaveCb ? null : parentElm,
                    nodeOps.nextSibling(oldElm)
                );
                if (isDef(vnode.parent)) {
                    let ancestor = vnode.parent;
                    let patchable = isPatchable(vnode);
                    while (ancestor) {
                        for (let i = 0; i < cbs.destroy.length; ++i) {
                            cbs.destroy[i](ancestor);
                        }
                        ancestor.elm = vnode.elm;
                        if (patchable) {
                            for (let i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                                cbs.create[i$1](emptyNode, ancestor);
                            }
                            // #6513
                            // invoke insert hooks that may have been merged by create hooks.
                            // e.g. for directives that uses the "inserted" hook.
                            var insert = ancestor.data.hook.insert;
                            if (insert.merged) {
                                // start at index 1 to avoid re-invoking component mounted hook
                                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                                    insert.fns[i$2]();
                                }
                            }
                        } else {
                            registerRef(ancestor);
                        }
                        ancestor = ancestor.parent;
                    }
                }
    
                // destroy old node
                if (isDef(parentElm)) {
                    removeVnodes([oldVnode], 0, 0);
                } else if (isDef(oldVnode.tag)) {
                    invokeDestroyHook(oldVnode);
                }
            }
        }
    }
}