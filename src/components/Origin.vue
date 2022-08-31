<script >
    class myObserver{
        constructor(value) {
            this.value = value;
            defs(value, '__ob__', this);
            if(Array.isArray(value)) {

            } else {
                this.walk(value);
            }
        }
        walk(obj) {
            const keys = Object.keys(obj);
            for(let i in keys) {
                defineReactive(obj, keys[i]);
            }
        }
    }
    function defs(obj, key, val) {
        Object.defineProperty(obj, key, {
            value: val,
        });
    }
    function remove(subs, item) {
        if(subs.length) {
            let index = subs.indexOf(item);
            if(index > -1) {
                return subs.splice(index, 1);
            }
        }
    }

    function defineReactive(obj, key, val) {
        if(arguments.length == 2) {
            val = obj[key];
        }
        if(typeof val == 'object') {
            new myObserver(val);
        }
        const dep = new Dep();
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log(`获取${obj}的${key}`);
                dep.depend();
                return val;
            },
            set(newVal) { 
                if(val === newVal) {
                    return;
                }
                console.log(`修改${obj}的${key}`);
                val = newVal;
                dep.notify();
            }
        });
    }

    class Dep{
        constructor() {
            this.subs = [];
        }
        addsub(sub) {
            this.subs.push(sub);
        }
        removesub(sub) {
            remove(this.subs, sub);
        }
        depend() {
            if(Dep.target) {
                Dep.target.addDep(this);
            }
        }
        notify() {
            const subs = this.subs.slice();
            for(let i=0;i<subs.length;i++) {
                subs[i].update();
            }
        }
    }

    Dep.target = null;
    let targetStack = [];
    function pushTarget(target) {
        targetStack.push(target);
        Dep.target = target;
    }
    function popTarget() {
        targetStack.pop();
        Dep.target = targetStack[targetStack.length -1];
    }

    class Watcher{
        constructor(vm, expOrFn, cb) {
            this.vm = vm;
            this.cb = cb;
            this.getter = parsePath(expOrFn);
            this.value = this.get();
        }
        get() {
            pushTarget(this);
            const vm = this.vm;
            let value = this.getter.call(vm, vm);
            return value;
        }
        update() {
            const oldValue = this.value;
            this.value = this.get();
            this.cb.call(this.vm, this.value, oldValue);
        }
    }

    let car = new myObserver({
        name: 'gg',
        age: 11
    });
    console.log(car.value.name, car.value.age);
    car.value.age = 22;
    export default{};
</script>
<template></template>