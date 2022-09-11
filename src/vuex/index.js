import {reactive} from 'vue';

class myCreateStore{
    constructor(options) {
        this.state = reactive(options.state);
        this.mutations = {};
        this.getters = {};
        this.actions = {};
        let mutateKeys = Object.keys(options.mutations);
        mutateKeys.forEach((item, index) => {
            this.mutations[item] = (data) => {
                options.mutations[item](this.state, data);
            }
        });
        let getKeys = Object.keys(options.getters);
        getKeys.forEach((item, index) => {
            Object.defineProperty(this.getters, item, {
                get:() => {
                    return options.getters[item](this.state);
                }
            });
        });
        let actionKeys = Object.keys(options.actions);
        actionKeys.forEach((item, index) => {
            this.actions[item] = (data) => {
                options.actions[item](this, data);
            }
        });
    }
    commmit(name, data) {
        this.mutations[name](data);
    }
    dispatch(name, data) {
        this.actions[name](data);
    }
}

let store = new myCreateStore({
    state: {
        name: 'isName',
        age: 11
    },
    getters: {
        getNames(state) {
            return state.name + ': this is getnames';
        },
    },
    mutations: {
        setName(state, payload) {
            state.name = payload;
        }
    },
    actions: {
        setAgeAsync({state}, payload) {
            setTimeout(() => {
                state.age = payload;
            }, 100);
        }
    },
});

console.log(store.getters.getNames)
store.commmit('setName', 'new name');
console.log(store.state.name);
store.dispatch('setAgeAsync', '21 years old');
console.log(store.state.age);
setTimeout(() => {
    console.log(store.state.age);
}, 100);