const arrProto = Array.prototype;
export const arrMethods = Object.create(arrProto);
export const methodsToPatch = [
    'push',
    'pop',
    'unshift',
    'shift',
    'sort',
    'splice',
    'reverse'
];
export const arrKeys = Object.getOwnPropertyNames(arrMethods);

methodsToPatch.forEach((method, index) => {
    const original = arrProto[method];
    Object.defineProperty(arrMethods, method, {
        enumerable: false, 
        configurable: true,
        writable: true,
        value(...args) {
            let val = original.apply(this, args);
            let ob = this.__ob__;
            let inserted;
            switch(method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
            }
            if(inserted) {
                ob.observeArray(inserted);
            }
            console.log(method, 'arr 变化');
            ob.dep.notify();
            return val;
        }
    });
});