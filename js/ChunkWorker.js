var dimensions,shortFrom,shortTo,longFrom,longTo;

onmessage = (message)=>{
    /**
     * @type {GameEvent}
    */
   var event = message.data;

    var func = event.func;

    /**
     * @type {WorkerChunk}
     */
    var chunk = event.args[0];
    dimensions = chunk.dimensions;
    shortFrom = chunk.shortFrom;
    shortTo = chunk.shortTo;
    longFrom = chunk.longFrom;
    longTo = chunk.longTo;
    
    WorkerChunk[func](...event.args);
}

function smoothStep(x) {
    const x2 = x * x;
    const x3 = x2 * x;
    return -2 * x3 + 3 * x2;
}
function interpolate(a0, a1, w) {
    const w2 = w * w;
    return (a1 - a0) * (3 - 2 * w) * w2 + a0;
}

function randomGradient(ix, iy){
    var w = 8 * 32;
    var s = w * 0.5;

    var a = ix, b = iy;
    a *= 3284157443; b ^= a << s | a >>> w-s;
    b *= 3284157443; a ^= b << s | b >>> w-s; 
    a *= 2048419325;
    var random = a * (Math.PI / (~(~0 >>> 1)));

    return {
        x: Math.cos(random),
        y: Math.sin(random)
    }
}

function dotGridGradient(ix, iy, x, y){
    var gradient = randomGradient(ix, iy);

    var dx = x - ix;
    var dy = y - iy;

    return dx * gradient.x + dy * gradient.y;
}

function perlin(x, y) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0;
    const sy = y - y0;

    const n0 = dotGridGradient(x0, y0, x, y);
    const n1 = dotGridGradient(x1, y0, x, y);
    const ix0 = interpolate(n0, n1, sx);

    const n2 = dotGridGradient(x0, y1, x, y);
    const n3 = dotGridGradient(x1, y1, x, y);
    const ix1 = interpolate(n2, n3, sx);

    return interpolate(ix0, ix1, sy);
}

function clampBetween(val, fMin = -1, fMax = 1, tMin = 0, tMax = 1) {
    const r0 = fMax - fMin;
    const r1 = tMax - tMin;

    const v0 = (val - fMin) / r0;
    return (v0 + tMin) * r1;
}

const block = {
    front: function(x,y,z,m,iC){
        let positions = [
            x, y -m, z +m,
            x +m, y -m, z +m,
            x +m, y, z +m,
            x, y, z +m,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            0,0,
            1,0,
            1,1,
            0,1,];
        let normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    },
    back: function(x,y,z,m,iC){
        let positions = [
            x, y -m, z,
            x, y, z,
            x +m, y, z,
            x +m, y -m, z,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            1,0,
            0,0,
            0,1,
            1,1,];
        let normals = [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    },
    left: function(x,y,z,m,iC){
        let positions = [
            x, y -m, z,
            x, y -m, z +m,
            x, y, z +m,
            x, y, z,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            0,0,
            1,0,
            1,1,
            0,1,];
        let normals = [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    },
    right: function(x,y,z,m,iC){
        let positions = [
            x +m, y -m, z,
            x +m, y, z,
            x +m, y, z +m,
            x +m, y -m, z +m,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            1,0,
            1,1,
            0,1,
            0,0,];
        let normals = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    },
    top: function(x,y,z,m,iC){
        let positions = [
            x, y, z,
            x, y, z +m,
            x +m, y, z +m,
            x +m, y, z,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            0,1,
            1,1,
            1,0,
            0,0];
        let normals = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    },
    bottom: function(x,y,z,m,iC){
        let positions = [
            x, y -m, z,
            x +m, y -m, z,
            x +m, y -m, z +m,
            x, y -m, z +m,
        ];

        let indices = [iC,iC+1,iC+2,iC,iC+2,iC+3]

        let uvs = [
            1,1,
            0,1,
            0,0,
            1,0,];
        let normals = [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0];

        return {
            positions,
            indices,
            uvs,
            normals
        }
    }
}

function GetChunk(x,y,chunks){
    if(chunks[x] && chunks[x][y]){
        var chunk = chunks[x][y];
        if(chunk.modified){
            chunk.modified = false;
        }
        return chunk;
    }else{
        var chunk = new WorkerChunk(x,y);
        if(!chunks[x]) chunks[x] = {};
        chunks[x][y] = chunk;
        return chunk;
    }
}

class WorkerChunk{
    /**
     * 
     * @param {Chunk} chunk 
     */
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.GeneratePartial();
    }
    
    x;y;
    
    /**
     * @type {number[][][]}
    */
   blocks = [];
   
   model = {
       front: {index:0,length:0},
       back:  {index:0,length:0},
       left:  {index:0,length:0},
       right: {index:0,length:0},
       top:   {index:0,length:0},
       bottom:{index:0,length:0},
    }

    partialChunk = [
        [],
        [],
        [],
        []
    ];
        //front (0 0) - 15 0 (15 0) (0-15)
        //back (0 15) - 15 15 (0 15) (16-31)
        //left (0 1) - 0 14 (0 0) (32-45)
        //right (15 1) - 15 14 (15 15) (46-59)
 
    GetPartialBlock(x,y,z){
        if(x > 0 && x < dimensions.x-1 && z > 0 && z < dimensions.z-1) return false;
        switch(z){
            case 0:
                if(y < this.partialChunk[0][x]) return true;
                break;
            case dimensions.z-1:
                if(y < this.partialChunk[1][x]) return true;
                break;
            default:
                switch(x){
                    case 0:
                        if(y < this.partialChunk[2][z]) return true;
                        break;
                    case dimensions.x-1:
                        if(y < this.partialChunk[3][z]) return true;
                        break;
                }
        }
        return false;
    }
 
    GeneratePartial(){
        var posX = dimensions.x*this.x;
        var posZ = dimensions.z*this.y;
 
        var j = 0;
        for(let i = 0; i < 4; i++){
            for(let lx = 0; lx < dimensions.x; lx++){
                var x;
                var y;
                switch(i){
                    case 0:
                        x = posX+lx;
                        y = posZ;
                        break;
                    case 1:
                        x = posX+lx;
                        y = posZ+15;
                        break;
                    case 2:
                        //if(lx == 0 || lx == 15) continue;
                        x = posX;
                        y = posZ+lx;
                        break;
                    case 3:
                        //if(lx == 0 || lx == 15) continue;
                        x = posX+15;
                        y = posZ+lx;
                        break;
                }
                //var h0 = perlin((x)*0.09,(y)*0.09);
                var h1 = perlin((x)*0.015,(y)*0.015);
                //var h = Math.round(clampBetween(h0,-1,1,shortFrom,shortTo))+Math.round(clampBetween(h1,-1,1,longFrom,longTo));
                //this.partialChunk[i][lx] = dimensions.y*0.5-h;
                this.partialChunk[i][lx] = dimensions.y*0.5-Math.round(clampBetween(h1,-1,1,longFrom,longTo));
                j++;
            }
        }
    }

    /**
     * 
     * @param {WorkerChunk} chunk 
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    static GenerateBlocks(chunk,x,y){
        if(chunk == null) return;
        //postMessage({status:'unlock'});

        var dimensions = chunk.dimensions;
        var posX = dimensions.x*x;
        var posZ = dimensions.z*y;

        var blockbuffer = new ArrayBuffer(dimensions.x * dimensions.y * dimensions.z);
        // x z y
        // 

        for(let lx = 0; lx < dimensions.x; lx++){
            //chunk.blocks.push(new Array(dimensions.z).fill(new Array(dimensions.y).fill(0)));
            for(let lz = 0; lz < dimensions.z; lz++){
    
                //var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                //var h = Math.round(clampBetween(h0,-1,1,chunk.shortFrom,chunk.shortTo))+Math.round(clampBetween(h1,-1,1,chunk.longFrom,chunk.longTo));
                //chunk.blocks[lx][lz].fill(1,dimensions.y*0.5-h);

                //chunk.blocks[lx][lz] = chunk.blocks[lx][lz].fill(1,0,dimensions.y * 0.5 - h);
                chunk.blocks[lx][lz] = chunk.blocks[lx][lz].fill(1,0,dimensions.y * 0.5 - Math.round(clampBetween(h1,-1,1,chunk.longFrom,chunk.longTo)));
            }
        }
        postMessage({status:'blocks',chunk,message:null});
    }

    static GenerateLOD1Model(chunk) {
        //console.log('generating')
        const model = chunk.model;
        const blocks = chunk.blocks;
        
        var dimensions = chunk.dimensions;
        var posX = dimensions.x*chunk.x;
        var posZ = dimensions.z*chunk.y;

        const m = 1;
        var chunks = [];
        /**
         * @type {number[]}
         */
        var aindicies = [];
        /**
         * @type {number[][]}
         */
        var gpositions=[[],[],[],[],[],[]],
        /**
         * @type {number[]}
         */
        gindices=[0,0,0,0,0,0],
        /**
         * @type {number[][]}
         */
        guvs=[[],[],[],[],[],[]],
        /**
         * @type {number[][]}
         */
        gnormals=[[],[],[],[],[],[]];

        var iC = 0;

        function getHeight(h0,h1){
            return dimensions.y * 0.5 - Math.round(clampBetween(h0,-1,1,chunk.shortFrom,chunk.shortTo))+Math.round(clampBetween(h1,-1,1,chunk.longFrom,chunk.longTo));
        }

        for(let lx = 0; lx < dimensions.x; lx++){
            //chunk.blocks.push(new Array(dimensions.z).fill(new Array(dimensions.y).fill(0)));
            for(let lz = 0; lz < dimensions.z; lz++){
    
                var x = posX+lx;
                var y = posZ+lz;

                // Current height
                var h0 = perlin(x*0.09,y*0.09);
                var h1 = perlin(x*0.015,y*0.015);
                var ch = getHeight(h0,h1);
                
                // Next height on the x axis
                h0 = perlin((x-1)*0.09,y*0.09);
                h1 = perlin((x-1)*0.015,y*0.015);
                var nhx = getHeight(h0,h1);

                // Next height on the y axis
                h0 = perlin(x*0.09,(y-1)*0.09);
                h1 = perlin(x*0.015,(y-1)*0.015);
                var nhy = getHeight(h0,h1);

                var diffX = ch - nhx;
                for(let i = nhx; i > 0; --i){

                }

                var diffY = ch - nhy;

                // Adds top
                var {positions,indices,uvs,normals} = block.top(x,ch,y,m,iC);
                                
                Array.prototype.push.apply(gpositions[4],positions);
                Array.prototype.push.apply(aindicies,indices);
                Array.prototype.push.apply(guvs[4],uvs);
                Array.prototype.push.apply(gnormals[4],normals);
                iC+=4;
                gindices[4] += 6;
                // start: 0, end: dimensions.y * 0.5 - h
            }
        }
    
        /*
        for (let x = 0; x < blocks.length; ++x) {
            for (let z = 0; z < blocks[0].length; ++z) {
                for (let y = 0; y < blocks[0][0].length; ++y) {
                    const blockType = blocks[x][z][y] || 0;
    
                    if (blockType !== 0) {
                        const frontCondition = !blocks[x][z + 1] || blocks[x][z + 1][y] === 0;
                        const backCondition = !blocks[x][z - 1] || blocks[x][z - 1][y] === 0;
                        const leftCondition = !blocks[x - 1] || !blocks[x - 1][z] || blocks[x - 1][z][y] === 0;
                        const rightCondition = !blocks[x + 1] || !blocks[x + 1][z] || blocks[x + 1][z][y] === 0;
                        const topCondition = !blocks[x][z][y + 1] || blocks[x][z][y + 1] === 0;
                        const bottomCondition = !blocks[x][z][y - 1] || blocks[x][z][y - 1] === 0;
    
                        
                        if (frontCondition) {
                            if(!(z == dimensions.z-1 && GetChunk(chunk.x,chunk.y+1,chunks).GetPartialBlock(x,y,0))){
                                var {positions,indices,uvs,normals} = block.front(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[0],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[0],uvs);
                                Array.prototype.push.apply(gnormals[0],normals);
                                iC+=4;
                                gindices[0] += 6;
                            }
                        }
    
                        if (backCondition) {
                            if(!(z == 0 && GetChunk(chunk.x,chunk.y-1,chunks).GetPartialBlock(x,y,chunkDimensions.z-1))){
                                var {positions,indices,uvs,normals} = block.back(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[1],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[1],uvs);
                                Array.prototype.push.apply(gnormals[1],normals);
                                iC+=4;
                                gindices[1] += 6;
                            }
                        }
    
                        if (leftCondition) {
                            if(!(x == 0 && GetChunk(chunk.x-1,chunk.y,chunks).GetPartialBlock(chunkDimensions.x-1,y,z))){
                                var {positions,indices,uvs,normals} = block.left(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[2],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[2],uvs);
                                Array.prototype.push.apply(gnormals[2],normals);
                                iC+=4;
                                gindices[2] += 6;
                            }
                        }
    
                        if (rightCondition) {
                            if(!(x == dimensions.x-1 && GetChunk(chunk.x+1,chunk.y,chunks).GetPartialBlock(0,y,z))){
                                var {positions,indices,uvs,normals} = block.right(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[3],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[3],uvs);
                                Array.prototype.push.apply(gnormals[3],normals);
                                iC+=4;
                                gindices[3] += 6;
                            }
                        }
                        
                        //console.log(!blocks[x][z][y + 1], !blocks[x][z][y + 1] || blocks[x][z][y + 1] === 0);
                        if (topCondition) {
                            var {positions,indices,uvs,normals} = block.top(x,y,z,m,iC);
                                
                            Array.prototype.push.apply(gpositions[4],positions);
                            Array.prototype.push.apply(aindicies,indices);
                            Array.prototype.push.apply(guvs[4],uvs);
                            Array.prototype.push.apply(gnormals[4],normals);
                            iC+=4;
                            gindices[4] += 6;
                        }
                        
                        
                        if (bottomCondition) {
                            var {positions,indices,uvs,normals} = block.bottom(x,y,z,m,iC);
                                
                            Array.prototype.push.apply(gpositions[5],positions);
                            Array.prototype.push.apply(aindicies,indices);
                            Array.prototype.push.apply(guvs[5],uvs);
                            Array.prototype.push.apply(gnormals[5],normals);
                            iC+=4;
                            gindices[5] += 6;
                        }
                        
                    }
                }
            }
        }
        */

        let fpl = gindices[0];
        model.front.length = fpl;

        let bpl = gindices[1];
        model.back.index = fpl * 2;
        model.back.length = bpl;

        let lpl = gindices[2];
        model.left.index = (fpl + bpl) * 2;
        model.left.length = lpl;

        let rpl = gindices[3];
        model.right.index = (fpl + bpl + lpl) * 2;
        model.right.length = rpl;

        let tpl = gindices[4];
        model.top.index = (fpl + bpl + lpl + rpl) * 2;
        model.top.length = tpl;

        let bopl = gindices[5];
        model.bottom.index = (fpl + bpl + lpl + rpl + tpl) * 2;
        model.bottom.length = bopl;

        var pos = gpositions.flat();
        var uv = guvs.flat();
        var norm = gnormals.flat();

        var arrays = [
            new Float32Array(pos),
            new Uint16Array(aindicies),
            new Float32Array(uv),
            new Float32Array(norm)
        ];
        var buffers = arrays.map(val=>val.buffer);

        postMessage({status:'model',chunk,arrays},buffers);
    }

    static GenerateModel(chunk) {
        //console.log('generating')
        const model = chunk.model;
        const blocks = chunk.blocks;
        const chunkDimensions = chunk.dimensions;
        const m = 1;
        var chunks = [];
        /**
         * @type {number[]}
         */
        var aindicies = [];
        /**
         * @type {number[][]}
         */
        var gpositions=[[],[],[],[],[],[]],
        /**
         * @type {number[]}
         */
        gindices=[0,0,0,0,0,0],
        /**
         * @type {number[][]}
         */
        guvs=[[],[],[],[],[],[]],
        /**
         * @type {number[][]}
         */
        gnormals=[[],[],[],[],[],[]];

        var iC = 0;
    
        for (let x = 0; x < blocks.length; ++x) {
            for (let z = 0; z < blocks[0].length; ++z) {
                for (let y = 0; y < blocks[0][0].length; ++y) {
                    const blockType = blocks[x][z][y] || 0;
    
                    if (blockType !== 0) {
                        const frontCondition = !blocks[x][z + 1] || blocks[x][z + 1][y] === 0;
                        const backCondition = !blocks[x][z - 1] || blocks[x][z - 1][y] === 0;
                        const leftCondition = !blocks[x - 1] || !blocks[x - 1][z] || blocks[x - 1][z][y] === 0;
                        const rightCondition = !blocks[x + 1] || !blocks[x + 1][z] || blocks[x + 1][z][y] === 0;
                        const topCondition = !blocks[x][z][y + 1] || blocks[x][z][y + 1] === 0;
                        const bottomCondition = !blocks[x][z][y - 1] || blocks[x][z][y - 1] === 0;
    
                        
                        if (frontCondition) {
                            if(!(z == dimensions.z-1 && GetChunk(chunk.x,chunk.y+1,chunks).GetPartialBlock(x,y,0))){
                                var {positions,indices,uvs,normals} = block.front(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[0],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[0],uvs);
                                Array.prototype.push.apply(gnormals[0],normals);
                                iC+=4;
                                gindices[0] += 6;
                            }
                        }
    
                        if (backCondition) {
                            if(!(z == 0 && GetChunk(chunk.x,chunk.y-1,chunks).GetPartialBlock(x,y,chunkDimensions.z-1))){
                                var {positions,indices,uvs,normals} = block.back(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[1],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[1],uvs);
                                Array.prototype.push.apply(gnormals[1],normals);
                                iC+=4;
                                gindices[1] += 6;
                            }
                        }
    
                        if (leftCondition) {
                            if(!(x == 0 && GetChunk(chunk.x-1,chunk.y,chunks).GetPartialBlock(chunkDimensions.x-1,y,z))){
                                var {positions,indices,uvs,normals} = block.left(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[2],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[2],uvs);
                                Array.prototype.push.apply(gnormals[2],normals);
                                iC+=4;
                                gindices[2] += 6;
                            }
                        }
    
                        if (rightCondition) {
                            if(!(x == dimensions.x-1 && GetChunk(chunk.x+1,chunk.y,chunks).GetPartialBlock(0,y,z))){
                                var {positions,indices,uvs,normals} = block.right(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[3],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[3],uvs);
                                Array.prototype.push.apply(gnormals[3],normals);
                                iC+=4;
                                gindices[3] += 6;
                            }
                        }
                        
                        //console.log(!blocks[x][z][y + 1], !blocks[x][z][y + 1] || blocks[x][z][y + 1] === 0);
                        if (topCondition) {
                            var {positions,indices,uvs,normals} = block.top(x,y,z,m,iC);
                                
                            Array.prototype.push.apply(gpositions[4],positions);
                            Array.prototype.push.apply(aindicies,indices);
                            Array.prototype.push.apply(guvs[4],uvs);
                            Array.prototype.push.apply(gnormals[4],normals);
                            iC+=4;
                            gindices[4] += 6;
                        }
                        
                        
                        if (bottomCondition) {
                            var {positions,indices,uvs,normals} = block.bottom(x,y,z,m,iC);
                                
                            Array.prototype.push.apply(gpositions[5],positions);
                            Array.prototype.push.apply(aindicies,indices);
                            Array.prototype.push.apply(guvs[5],uvs);
                            Array.prototype.push.apply(gnormals[5],normals);
                            iC+=4;
                            gindices[5] += 6;
                        }
                        
                    }
                }
            }
        }

        let fpl = gindices[0];
        model.front.length = fpl;

        let bpl = gindices[1];
        model.back.index = fpl;
        model.back.length = bpl;

        let lpl = gindices[2];
        model.left.index = (fpl + bpl);
        model.left.length = lpl;

        let rpl = gindices[3];
        model.right.index = (fpl + bpl + lpl);
        model.right.length = rpl;

        let tpl = gindices[4];
        model.top.index = (fpl + bpl + lpl + rpl);
        model.top.length = tpl;

        let bopl = gindices[5];
        model.bottom.index = (fpl + bpl + lpl + rpl + tpl);
        model.bottom.length = bopl;

        var pos = gpositions.flat();
        var uv = guvs.flat();
        var norm = gnormals.flat();

        var arrays = [
            new Float32Array(pos),
            new Uint16Array(aindicies),
            new Float32Array(uv),
            new Float32Array(norm)
        ];
        var buffers = arrays.map(val=>val.buffer);

        postMessage({status:'model',chunk,arrays},buffers);
    }
}