var asyncStack = [];
var available = true;
var used = 0;
var max;
var loop;
var interval = 10;

onmessage = async (ev)=>{
    /**
     * @type {{method:('add'|'start'|'stop'|'return'|'unlock'),event?:number,workers?:number}}
     */
    let data = ev.data;
    switch(data.method){
        case 'start':
            max = data.workers;
            EventLoop();
            break;
        case 'add':
            asyncStack.push(data.event);
            Cycle();
            break;
        case 'return':
            asyncStack.unshift(data.event);
            Cycle();
            break;
        case 'stop':
            clearInterval(loop);
            break;
        case 'unlock':
            available = true;
            --used;
            break;
    }

}

function EventLoop(){
    loop = setInterval(Cycle, interval);
}

function Cycle(){
    if(used < max && asyncStack.length > 0){
        let ev = asyncStack.shift();
        ++used;
        postMessage(ev);
    }
}