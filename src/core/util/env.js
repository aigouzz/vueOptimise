/**
 * 基本数据类型
 */
import {isNative} from '../observer/api';

let _Set;
if(typeof Set && isNative(Set)) {
    _Set = Set;
} else {
    _Set = ((function() {
        function Set() {
            this.set = Object.create(null);
        }
        Set.prototype.has = function(key) {
            return this.set[key] === true;
        }
        Set.prototype.add = function(key) {
            this.set[key] = true;
        }
        Set.prototype.clear = function () {
            this.set = Object.create(null);
        }

        return Set;
    })())
}

export {_Set};
