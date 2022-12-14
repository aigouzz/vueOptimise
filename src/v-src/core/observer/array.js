
import { def } from '../util/index';

const arrProto = Array.prototype;
export const arrayMethods = Object.create(arrProto);
export const methodsToPatch = [
    'push',
    'pop',
    'unshift',
    'shift',
    'sort',
    'splice',
    'reverse'
];
export const arrKeys = Object.getOwnPropertyNames(arrayMethods);

methodsToPatch.forEach((method, index) => {
    const original = arrProto[method];
    def(arrayMethods, method, function(...args) {
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
        // ob.dep.notify()
        if (__DEV__) {
            ob.dep.notify({
                type: TriggerOpTypes.ARRAY_MUTATION,
                target: this,
                key: method
            })
        } else {
            ob.dep.notify()
        }
        return val;
    });
});