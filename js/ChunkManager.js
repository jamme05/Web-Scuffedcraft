class ChunkManager{
    /**
     * @type {Object<string,Object<string,Chunk>>}
     */
    chunks = {};
    static gl;

    /**
     * @type {GameEvent[]}
     */
    eventStack = [];
    finished = true;

    #hasChanged = false;
    /**
     * @type {Chunk[]}
     */
    #chunkArray = [];
    get ChunkArray(){
        if(this.#hasChanged) this.#chunkArray = Object.values(this.chunks).map((v)=>Object.values(v)).flat();
        this.#hasChanged = false;
        return this.#chunkArray;
    }

    chunkLog = [];

    radius;
    maxSavedChunks;
    shortFrom = -2;
    shortTo = 5;
    longFrom = 0;
    longTo = 50;

    dimensions = {x:16,y:256,z:16}

    parentWorker;
    /**
     * @type {{worker:Worker,queue:number}[]}
     */
    workers = [

    ];

    /**
     * @type {number[][][]}
     */
    baseBlocks = [];

    constructor(gl,radius=8,maxSavedChunks=64,workerCount=3){
        this.radius = radius;
        this.maxSavedChunks = maxSavedChunks;
        Chunk.Manager = this;
        Chunk.dimensions = this.dimensions;
        ChunkManager.gl = gl;

        for(let lx = 0; lx < this.dimensions.x; ++lx){
            this.baseBlocks.push([]);
            for(let lz = 0; lz < this.dimensions.z; ++lz){
                this.baseBlocks[lx].push([]);
                for(let ly = 0; ly < this.dimensions.y; ++ly){
                    this.baseBlocks[lx][lz].push(0);
                }
            }
            //this.baseBlocks.push(new Array(this.dimensions.z).fill(new Array(this.dimensions.y).fill(0)));
        }

        for(let i = 0; i < workerCount; ++i){
            /**
             * @type {Worker | {index:number}}
             */
            let worker = new Worker('js/ChunkWorker.js',{name:'ChunkWorker_'+i});
            worker.index = i;
            this.workers.push({
                worker,
                queue:0,
            });

            worker.onmessage = (ev)=>{
                /**
                 * @type {{status:('model'|'partial'|'blocks'|'error'|'unlock'),chunk:WorkerChunk,message?:string}}
                 */
                var data = ev.data;

                switch(data.status){
                    case 'unlock':
                        --this.workers[worker.index].queue;
                        break;
                    case 'blocks':
                        var chunk = data.chunk;
                        var tChunk = this.chunks[chunk.x][chunk.y]; // target chunk

                        tChunk.blocks = chunk.blocks;
                        tChunk.generatedBlocks = true;
                        tChunk.generatingBlocks = false;
                        --this.workers[worker.index].queue;
                        break;
                    case 'model':
                        var chunk = data.chunk;
                        var tChunk = this.chunks[chunk.x][chunk.y]; // target chunk

                        tChunk.model = chunk.model;
                        
                        var [positions,indices,uvs,normals] = data.arrays;
                        // Upload position data
                        gl.bindBuffer(gl.ARRAY_BUFFER, tChunk.buffers.positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
                        
                        // Upload index data
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tChunk.buffers.indexBuffer);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

                        // Upload UV data
                        gl.bindBuffer(gl.ARRAY_BUFFER, tChunk.buffers.uvBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

                        gl.bindBuffer(gl.ARRAY_BUFFER,tChunk.buffers.normalBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

                        tChunk.generated = true;
                        tChunk.generating = false;
                        --this.workers[worker.index].queue;
                        break;
                }
                this.parentWorker.postMessage({method:'unlock'});
            }
        }

        Chunk.positionAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'position');
        Chunk.uvAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'uv');
        Chunk.uvAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'normal');

        this.parentWorker = new Worker('js/ParentWorker.js',{name:'EventWorker'});
        this.parentWorker.onmessage = (ev)=>{
            this.ExecuteEvent(ev.data);
        }
        this.parentWorker.postMessage({method:'start',workers:this.workers.length});
    }

    Clock(deltaTime){
        this.ChunkArray.forEach(v=>{
            v.active = false;
        });

        this.finished = false;

        this.ExecuteEvents(deltaTime)
        .then(()=>{
            this.finished = true;
            this.#hasChanged = true;
        });
    }

    asyncEvents = [];

    AddAsyncEvent(event){
        var i = this.asyncEvents.findIndex((v)=>v == null);
        if(i == -1) i = this.asyncEvents.push(event) -1;
        else this.asyncEvents[i] = event;
        //console.log(this.asyncEvents);
        this.parentWorker.postMessage({method:'add',event:i});
    }

    ReturnAsyncEvent(event){
        this.parentWorker.postMessage({method:'return',event});
    }

    lastChosen = null;
    ExecuteEvent(next){
        if(next !== undefined){
            var i = this.workers.findIndex((val)=>val.queue < 1);
            if(i === -1) {this.ReturnAsyncEvent(next); return;}
            if(this.lastChosen == i){
                ++i;
                if(i >= this.workers.length) i = 0;
            }
            this.lastChosen = i;
            var worker = this.workers[i];
            let event = this.asyncEvents[next];
            if(this.asyncEvents.length -1 == next) this.asyncEvents.pop();
            else this.asyncEvents[next] = null;
            worker.worker.postMessage(event);
            ++worker.queue;
        }
    }

    async ExecuteEvents(deltaTime){
        var timeSpent = 0;
        var lastTimeSpent = 0;
        var nextQueue = [];

        while(!this.finished && this.eventStack.length != 0 && 33 > (timeSpent + lastTimeSpent)){
            let startTime = Date.now();
            var next = this.eventStack.shift();
            
            await next.fire();
            timeSpent += lastTimeSpent = (Date.now()-startTime);
        }
        this.eventStack = this.eventStack.concat(nextQueue);
    }

    tempRadius = 0;
    tempIncreaseInterval = 100;
    growing = false;
    async RenderChunksWithin(plController,viewMatrix,fieldOfView,aspectRatio){
        var n = 0;
        let playerPos = plController.GetPosition();
        var r = this.radius;
        var tr = this.tempRadius;
        if(tr > r) this.tempRadius = tr = r;
        var pRoundedX = Math.round((-playerPos[0]-Chunk.dimensions.x*0.5)/Chunk.dimensions.x);
        var pRoundedY = Math.round((-playerPos[2]-Chunk.dimensions.z*0.5)/Chunk.dimensions.z);
        var {x:rx,y:ry} = plController.GetRotation();
        var direction = [
            Math.round(Math.cos(ry) * Math.cos(rx)),
            Math.round(Math.sin(rx)),
            Math.round(Math.sin(ry) * Math.cos(rx))
        ];
        GameManager.gl.uniform1i(Chunk.textureLocation, 0);
    
        /* Spinny method (rotates for each radius) Looks cool but kinda bad performance
        for(let tr = -1; tr < r; ++tr){
            var steps = tr * 8;
            var step = 2 * Math.PI / steps;

            for(let a = 0; a < steps; ++a){
                var angle = a*step;
                
                var x = Math.round(pRoundedX + tr * Math.cos(angle));
                var y = Math.round(pRoundedY + tr * Math.sin(angle));

                let chunk =  this.GetChunk(x,y);

                chunk.active = true;
                chunk.lifetime = Chunk.lifetime;
                n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
            }
        }
        /**/
        /* Dynamic printer method (in waves for each radius) it works but bad performance
        for(let nr = 0; nr < r; ++nr){
            for(let x = -nr; x <= nr; ++x){
                for(let y = -nr; y <= nr; ++y){
                    if(x > -nr && x < r && y > -nr && y < nr) continue;
                    if((x*x + y*y) > r*r) continue;
                    let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);        
                    
                    chunk.active = true;
                    chunk.lifetime = Chunk.lifetime;
                    chunk.gl.uniform1i(Chunk.textureLocation, 0);
                    n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
                }
            }
        }
        /**/
        /* Printer method (left to right, top to bottom) Good ol reliable
        for(let x = -r; x <= r; ++x){
            for(let y = -r; y <= r; ++y){
                if((x*x + y*y) > r*r){
                    continue;
                }
                let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);
                //console.log(pRoundedX+x,pRoundedY+y);
    
                
                chunk.active = true;
                chunk.lifetime = Chunk.lifetime;
                chunk.gl.uniform1i(Chunk.textureLocation, 0);
                n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
            }
        }
        /**/
        /* Timed dynamic printer method circle (left to right, top to bottom, radius gradually increases) good performance
        // Reset timer if generating too many new chunks?
        for(let x = -tr; x <= tr; ++x){
            for(let y = -tr; y <= tr; ++y){
                if((x*x + y*y) > tr*tr)continue;
                if(tr < r && !this.growing){
                    this.growing = true;
                    setTimeout(()=>{
                        this.growing = false;
                        ++this.tempRadius;
                    },this.tempIncreaseInterval * tr);
                }
                let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);
                
                chunk.active = true;
                chunk.lifetime = Chunk.lifetime;
                chunk.gl.uniform1i(Chunk.textureLocation, 0);
                n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
            }
        }
        /**/
        //* Timed dynamic printer method square (left to right, top to bottom, radius gradually increases) good performance
        // Reset timer if generating too many new chunks?
        for(let x = -tr; x <= tr; ++x){
            for(let y = -tr; y <= tr; ++y){
                if(tr < r && !this.growing){
                    this.growing = true;
                    setTimeout(()=>{
                        this.growing = false;
                        ++this.tempRadius;
                    },this.tempIncreaseInterval * tr);
                }
                let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);
                
                chunk.active = true;
                chunk.lifetime = Chunk.lifetime;
                chunk.gl.uniform1i(Chunk.textureLocation, 0);
                n+=chunk.Render(direction,tr);
            }
        }
        /**/
        //*
        this.ChunkArray.sort((a,b)=>a.lifetime - b.lifetime);
        let arr = this.ChunkArray.map((v)=>v);
        for(let i = 0; i < arr.length; ++i){
            let chunk = arr[i];
            if(chunk.active)continue;
            chunk.lifetime-=GameManager.deltaTime;
            if(chunk.lifetime <= 0){
                (()=>{
                    chunk.Dispose();
                    delete this.chunks[chunk.x][chunk.y]
                })();
            }
            //console.log('deleting chunk at',chunk.x,chunk.y);
        }
        /**/
        
        return n;
    }

    GetChunk(x,y){
        if(this.chunks[x] && this.chunks[x][y]){
            var chunk = this.chunks[x][y];
            if(chunk.modified){
                chunk.modified = false;
                //this.eventStack.push(new GameEvent(Chunk.GenerateAsync,chunk,x,y));
            }
            return chunk;
        }else{
            var chunk = new Chunk(x,y,ChunkManager.gl);
            if(!this.chunks[x]) this.chunks[x] = {};
            this.chunks[x][y] = chunk;
            //this.eventStack.push(new GameEvent(Chunk.GenerateAsync,chunk,x,y));
            return chunk;
        }
    }

    StackEvent(ev, sync, ...args){
        this.eventStack.push(new GameEvent(ev,sync,...args));
    }

    StackChunkEvent(ev, chunk, ...args){
        this.AddAsyncEvent(new AsyncEvent(ev,new WorkerChunk(chunk), ...args));
    }
}

class GameEvent{
    args;
    func;
    constructor(func,sync,...args){
        this.func = func
        if(typeof sync == 'boolean'){
            this.args = args;
            this.sync = sync;
        }else{
            this.sync = false;
            args.unshift(sync);
            this.args = args;
        }
    }
    async fire(){
        if (this.func[Symbol.toStringTag] === 'AsyncFunction'){
            return await this.func(...this.args);
        } else {
            return this.func(...this.args);
        }
    }
}
class AsyncEvent{
    args;
    func;
    /**
     * 
     * @param {((...any)=>void) | string} ev 
     * @param {...any} args
     */
    constructor(ev,...args){
        this.args = args;
        this.func = (typeof ev == 'string') ? ev:ev.name;
    }
}

class WorkerChunk{
    /**
     * 
     * @param {Chunk} chunk 
     */
    constructor(chunk){
        this.blocks = chunk.blocks;
        this.x = chunk.x;
        this.y = chunk.y;

        this.model = chunk.model;
        this.dimensions = Chunk.dimensions;
        
        this.shortFrom = Chunk.Manager.shortFrom;
        this.shortTo = Chunk.Manager.shortTo;
        this.longTo = Chunk.Manager.longTo;
        this.longFrom = Chunk.Manager.longFrom;
    }

    x;y;

    dimensions;
    shortFrom;
    shortTo;
    longFrom;
    longTo;

    /**
     * @type {number[][][]}
     */
    blocks = [];
    blockbuffer;

    model = {
        front: {index:0,length:0},
        back:  {index:0,length:0},
        left:  {index:0,length:0},
        right: {index:0,length:0},
        top:   {index:0,length:0},
        bottom:{index:0,length:0},
    }

    modelData = {
        positions:[],
        indices:[],
        uvs:[],
        normals:[]
    }
}