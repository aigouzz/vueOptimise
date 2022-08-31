const arrProto = Array.prototype;
const arrMethods = Object.create(arrProto);
const methodsToPatch = [
    'push',
    'pop',
    'unshift',
    'shift',
    'sort',
    'splice',
    'reverse'
];
const arrKeys = Object.getOwnPropertyNames(arrMethods);

methodsToPatch.forEach((method, index) => {
    const original = arrProto[method];
    Object.defineProperty(arrMethods, method, {
        enumerable: false, 
        configurable: true,
        writable: true,
        value(...args) {
            let val = original.apply(this, args);
            return val;
        }
    });
});