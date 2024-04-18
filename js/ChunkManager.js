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

    constructor(radius=8,maxSavedChunks=64,gl){
        this.radius = radius;
        this.maxSavedChunks = maxSavedChunks;
        Chunk.Manager = this;
        ChunkManager.gl = gl;

        Chunk.positionAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'position');
        Chunk.uvAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'uv');
        Chunk.uvAttributeLocation = gl.getAttribLocation(Chunk.shaderProgram, 'normal');
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

    async ExecuteEvents(){
        var timeSpent = 0;
        var lastTimeSpent = 0;
        var evc = 0;

        while(!this.finished && this.eventStack.length != 0 && 33 > (timeSpent + lastTimeSpent)){
            let startTime = Date.now();
            var next = this.eventStack.shift();

            await next.fire();
            //console.log(chunk);
            timeSpent += lastTimeSpent = (Date.now()-startTime);
            evc++;
        }
        //console.log(timeSpent,evc);
    }

    actives = document.getElementById('active');

    async RenderChunksWithin(plController,viewMatrix,fieldOfView,aspectRatio){
        var n = 0;
        let playerPos = plController.GetPosition();
        var r = this.radius;
        var pRoundedX = Math.round((-playerPos[0]-Chunk.dimensions.x*0.5)/Chunk.dimensions.x);
        var pRoundedY = Math.round((-playerPos[2]-Chunk.dimensions.z*0.5)/Chunk.dimensions.z);
        pRoundedX =
        pRoundedY = 0;
    
        Chunk.active = 0;

        for(let x = -r; x <= r; ++x){
            for(let y = -r; y <= r; ++y){
                let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);
                if((x*x + y*y) > r*r){
                    continue;
                }
                //console.log(pRoundedX+x,pRoundedY+y);
    
                
                chunk.active = true;
                chunk.lifetime = Chunk.lifetime;
                var direction = PlayerController.RoundedNormalizedRotation();
                n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
            }
        }
        //*
        var length = this.ChunkArray.length;
        this.ChunkArray.sort((a,b)=>a.lifetime - b.lifetime);
        let arr = this.ChunkArray.map((v)=>v);
        for(let chunk of arr){
            if(chunk.active)continue;
            chunk.lifetime-=GameManager.deltaTime;
            if(chunk.lifetime <= 0){
                (()=>{
                    chunk.Dispose();
                    delete this.chunks[chunk.x][chunk.y]
                })();
            }
            length--;
            //console.log('deleting chunk at',chunk.x,chunk.y);
        }

        this.actives.innerText = Chunk.active;
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

    StackEvent(ev,...args){
        this.eventStack.push(new GameEvent(ev,...args));
    }

    StackModelGenEvent(ev, chunk){
        this.eventStack.push(new GameEvent(ev,chunk,this.chunks));
    }
}

class GameEvent{
    args;
    func;
    constructor(func,...args){
        this.func = func;
        this.args = args;
    }
    async fire(){
        if (this.func[Symbol.toStringTag] === 'AsyncFunction') {
            return await this.func(...this.args);
        } else {
            return this.func(...this.args);
        }
    }
}