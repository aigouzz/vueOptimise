import { createApp } from 'vue'
import App from './App.vue'
import EventEmit from './api/emit'

createApp(App).mount('#app');



/**
 * 
 * 内存泄漏   闭包closure   分离dom  detachedhtml   console
 */
// function MyObject() {}
// (function () {
//     let arr = new Array(1000).fill(null).map(e => new MyObject());
//     window.arr2 = arr;
//     window.arr3 = arr;
//     function closure() {
//         let arr = new Array(1000).fill(null).map(e => 1);
//         return function fn() {
//             return arr;
//         }
//     }
//     window.clo1 = closure();//函数持有闭包不会释放内部变量
//     clo1 = null;//可以这么释放
//     let f = document.querySelector('#f');
//     f ? document.body.removeChild(f) : '';//f引用还在
//     f = null;// detached dom元素  已经分离的dom元素
//     let arr4 = new Array(10000).fill(null).map(e => new function() {});
//     console.log(arr4); //console也会引用arr4在内存中 在线上一般都会注释掉console
//     arr4 = null;
// })();
// window.arr2 = null; //最常见方式值为null
// window.arr3.length = 0;

// (function() {
//     let fns = [];
//     let arr = new Array(1000).fill(null).map(e => {
//         function tmp() {}
//         fns.push(tmp);
//         window.addEventListener('keypress', tmp);
//     });
//     fns.forEach(fn => {
//         window.removeEventListener('keypress', fn);
//     });
// })();

// let myCall= function() {
//     let arr = [];
//     for(let i = 1;i < arguments.length;i++) {
//         arr.push(arguments[i]);
//     }
//     arguments[0].func = this;
//     let res = arguments[0].func(...arr);
//     delete arguments[0].func;
//     return res;
// }
// Function.prototype.myCall = myCall;
// function example1() {
//     console.log(this.name);
// }
// let obj = {
//     name: 'guo'
// };
// example1.myCall(obj, {
//     type: 'args'
// });
// function myApply() {
//     let arr = [];
//     for(let i = 0;i < (arguments[1] ? arguments[1].length : 0);i ++) {
//         arr.push(arguments[1][i]);
//     }
//     let obj = arguments[0];
//     obj.func = this;
//     let res = obj.func(...arr);
//     delete obj.func;
//     return res;
// }
// Function.prototype.myApply = myApply;
// function example2() {
//     console.log(this);
//     console.log(this.age);
// }
// let obj1 = {
//     age: 12
// };
// example2.myApply(obj1, [1, 2, 3]);

/**
 * mvvm vue全家桶
 * computed实现
 * watch实现
 * eventBus实现
 * 低代码
 * 项目配置
 * 数据交互
 * 项目实战
 * vue3.0项目实战
 * ts+vue3
 * react
 * nodejs
 * 
 */
