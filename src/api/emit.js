class EventEmit{
    constructor() {
        this.events = [];
    }
    on(name, fn) {
        this.events.push({
            name,
            fn
        });
        return this.events;
    }
    off(listener){
        let index = this.events.indexOf(listener);
        this.events.splice(index, 1);
        return this.events;
    }
    emit(name, data) {
        let fnName = this.events.filter((item) => {
            return item.name == name;
        });
        if(fnName.length > 0) {
            fnName[0].fn(data);
        }
    }
}

let event1 = new EventEmit();
// event1.on('click', (data) => {
//     console.log('click this', data);
// });
// event1.on('tap', (data) => {
//     console.log('tap this', data);
// });
event1.emit('click', {name:'click'});

function* getRes() {
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
            console.log(1);
        }, 100);
    });
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
            console.log(2);
        }, 100);
    });
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(3);
            console.log(3);
        }, 100);
    });
}

let gen = getRes();
function loops(g) {
    let next = g.next();
    if(next.done) return;
    next.value.then(() => {
        loops(g);
    });
}

// loops(gen);

export default EventEmit;