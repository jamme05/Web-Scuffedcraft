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

function log(val){
    console.log(val);
    return val;
}
var logger = {};
class PartialChunk{
    constructor(dimensions){
        this.dimensions = dimensions;
    }
    dimensions = {x:16,y:256,z:16};
    x;y;
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
class Chunk{
    static texture;
    static modelMatrixLocation;
    static shaderProgram;
    /**
     * @type {ChunkManager}
     */
    static Manager;
    static lifetime = 60;
    lifetime = Chunk.lifetime;
    modelLifetime = 5;

    generatedBlocks = false;
    generatingBlocks = false;
    generated = false;
    generating = false;
    modified = false;
    active = false;

    partialChunk;

    x;
    y;
    blockbuffer;

    static dimensions = {x:16,y:256,z:16};

    gl;

    chunkMatrix = mat4.create();

    model = {
        front:  {index:0,length:0},
        back:   {index:0,length:0},
        left:   {index:0,length:0},
        right:  {index:0,length:0},
        top:    {index:0,length:0},
        bottom: {index:0,length:0},
    }

    buffers = {
        positionBuffer:null,
        indexBuffer:null,
        uvBuffer:null,
        normalBuffer:null,
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(x,y,gl){
        this.x = x;
        this.y = y;

        mat4.translate(this.chunkMatrix,this.chunkMatrix,[x*Chunk.dimensions.x,-Chunk.dimensions.y,y*Chunk.dimensions.z]);

        this.buffers.positionBuffer = gl.createBuffer();
        this.buffers.indexBuffer = gl.createBuffer();
        this.buffers.normalBuffer = gl.createBuffer();
        this.buffers.uvBuffer = gl.createBuffer();

        this.gl = gl;

        this.initAttributeLocations();

        this.GeneratePartial();
    }

    /**
     * 
     * @param {WorkerChunk} wChunk 
     */
    LoadWorkerChunk(wChunk){
        this.blocks = wChunk.blocks;
        this.model = wChunk.model;
    }

    GetBlock(x,y,z){
        var dimensions = Chunk.dimensions;
        var zm = dimensions.x * dimensions.z;

        x*= dimensions.x;
        z*= zm;

        var i = y + x + z;
        return this.blockbuffer[i];
    }

    initAttributeLocations(){
        const program = Chunk.shaderProgram,
        gl = this.gl;

        const positionAttributeLocation = gl.getAttribLocation(program, 'position');
        const uvAttributeLocation = gl.getAttribLocation(program, 'uv');
        const normalAttributeLocation = gl.getAttribLocation(program, 'normal');

        this.positionAttributeLocation = positionAttributeLocation;
        this.uvAttributeLocation = uvAttributeLocation;
        this.normalAttributeLocation = normalAttributeLocation;
    }

    Dispose(){
        this.gl.deleteBuffer(this.buffers.positionBuffer);
        this.gl.deleteBuffer(this.buffers.indexBuffer);
        this.gl.deleteBuffer(this.buffers.uvBuffer);
        this.gl.deleteBuffer(this.buffers.normalBuffer);
    }

    // 3d array
    /**
     * @type {number[][][]}
     */
    blocks = []

    GenerateModel(){
        //console.log('generating');
        const {positions,indices,uvs,normals} = this.generateChunkModel();

        // Upload position data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        
        // Upload index data
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        
        // Upload UV data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.uvBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uvs), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffers.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        this.generated = true;
    }

    /**
     * 
     * @param {Chunk} chunk 
     */
    static GenerateModel(chunk){
        //console.log('generating');
        if(chunk.lifetime <= 0){
            delete Chunk.Manager.chunks[chunk.x][chunk.y];
        }
        const gl = chunk.gl;
        const {positions,indices,uvs,normals} = chunk.generateChunkModel();
        // console.log(positions,indices,uvs,normals);

        // Upload position data
        gl.bindBuffer(gl.ARRAY_BUFFER, chunk.buffers.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Upload index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.buffers.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        
        // Upload UV data
        gl.bindBuffer(gl.ARRAY_BUFFER, chunk.buffers.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER,chunk.buffers.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        chunk.generated = true;
        chunk.generating = false;
    }

    static wireframe = 0;
    RenderSide(start, length){
        const gl = this.gl;
        // Draw
        gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, start);

        return length;
    }

    isInCameraView(viewMatrix,fieldOfView,aspectRatio) {
        const pointCameraSpace = vec3.create();
        let point = vec3.create();
        mat4.getTranslation(point,this.chunkMatrix);
        vec3.transformMat4(pointCameraSpace, point, viewMatrix);
  
        // Check near and far planes
        if (pointCameraSpace[2] < 0.1 || pointCameraSpace[2] > 1000) {
          return false;
        }
  
        // Check field of view
        const xRatio = Math.tan(fieldOfView / 2) * 0.1;
        const yRatio = xRatio / aspectRatio;
  
        if (
          Math.abs(pointCameraSpace[0] / pointCameraSpace[2]) > xRatio ||
          Math.abs(pointCameraSpace[1] / pointCameraSpace[2]) > yRatio
        ) {
          return false;
        }
  
        return true;
      }

    Render(playerRot,r){
        //console.log('trying to render', this.generated, this.x,this.y);
        if(!this.generatedBlocks && !this.generatingBlocks) {
            this.generatingBlocks = true;
            this.blocks = Chunk.Manager.baseBlocks;
            Chunk.Manager.StackChunkEvent('GenerateBlocks',this,this.x,this.y);
        }
        if(!this.generating && !this.generated && this.generatedBlocks){
            this.generating = true;
            Chunk.Manager.StackChunkEvent('GenerateModel',this);
            /*
            if(r < 5) Chunk.Manager.StackChunkEvent('GenerateModel',this);
            else Chunk.Manager.StackChunkEvent('GenerateLOD1Model',this);*/
        }
        if(!this.generated || !this.generatedBlocks) return 0;
        var n = 0;
        if(true){
            const gl = this.gl;

            const model = this.model;
            let renderFront = false,
            renderBack = false,
            renderLeft = false,
            renderRight = false,
            renderTop = false,
            renderBottom = false;

            
            if(playerRot[0] == 1){
                renderTop = 
                renderBottom = 
                renderFront =
                renderLeft = 
                renderRight = true;
            }

            if(playerRot[0] == -1){
                renderTop = 
                renderBottom = 
                renderBack =
                renderLeft = 
                renderRight = true;
            }

            if(playerRot[1] == 1){
                renderTop = 
                renderFront =
                renderBack =
                renderLeft = 
                renderRight = true;
            }

            if(playerRot[1] == -1){
                renderBottom = 
                renderFront =
                renderBack =
                renderLeft = 
                renderRight = true;
            }

            if(playerRot[2] == -1){
                renderTop =
                renderBottom = 
                renderFront =
                renderBack =
                renderRight = true;
            }

            if(playerRot[2] == 1){
                renderTop =
                renderBottom = 
                renderFront =
                renderBack =
                renderLeft = true;
            }

            const positions = this.buffers.positionBuffer,
            indices = this.buffers.indexBuffer,
            uvs = this.buffers.uvBuffer,
            normals = this.buffers.normalBuffer;

            gl.bindBuffer(gl.ARRAY_BUFFER, positions);
            const positionAttributeLocation = this.positionAttributeLocation;
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, uvs);
            const uvAttributeLocation = this.uvAttributeLocation;
            gl.enableVertexAttribArray(uvAttributeLocation);
            gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            const normalAttributeLocation = this.normalAttributeLocation;
            gl.enableVertexAttribArray(normalAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, normals);
            gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, Chunk.texture);

            gl.uniformMatrix4fv(Chunk.modelMatrixLocation, false, this.chunkMatrix);


            switch(Chunk.wireframe){                    
                case 2:
                    gl.uniform1i(Chunk.isLineLocation,0);
                    gl.drawElements(gl.LINES, model.bottom.index+model.bottom.length, gl.UNSIGNED_SHORT, 0);
                    //n+=model.bottom.index+model.bottom.length;
                    case 0:
                    gl.uniform1i(Chunk.isLineLocation,0);
                    if(renderFront) n+= this.RenderSide(0,model.front.length);
                    if(renderBack) n+= this.RenderSide(model.back.index*2,model.back.length);
                    if(renderLeft) n+= this.RenderSide(model.left.index*2,model.left.length);
                    if(renderRight) n+= this.RenderSide(model.right.index*2,model.right.length);
                    if(renderTop) n+= this.RenderSide(model.top.index*2,model.top.length);
                    if(renderBottom) n+= this.RenderSide(model.bottom.index*2,model.bottom.length);
                    break;
                case 1:
                    gl.uniform1i(Chunk.isLineLocation,1);
                    gl.drawElements(gl.LINES, model.bottom.index+model.bottom.length, gl.UNSIGNED_SHORT, 0);
                    //n+=model.bottom.index+model.bottom.length;
                    break;
            }
        }
        return n;
    }

    generateChunkModel() {
        //console.log('generating')
        const model = this.model;
        const blocks = this.blocks;
        const chunkDimensions = Chunk.dimensions;
        const m = 1;
        /**
         * @type {number[]}
         */
        var aindicies = [];
        /**
         * @type {number[][]}
         */
        var gpositions=[[],[],[],[],[],[]];
        /**
         * @type {number[]}
         */
        gindices=[0,0,0,0,0,0];
        /**
         * @type {number[][]}
         */
        guvs=[[],[],[],[],[],[]];
        /**
         * @type {number[][]}
         */
        gnormals=[[],[],[],[],[],[]];

        var iC = 0;
    
        for (let x = 0; x < blocks.length; ++x) {
            for (let z = 0; z < blocks[0].length; ++z) {
                for (let y = 0; y < blocks[0][0].length; ++y) {
                    const blockType = blocks[x][z][y];
    
                    if (blockType !== 0) {
                        const frontCondition = !blocks[x][z + 1] || blocks[x][z + 1][y] === 0;
                        const backCondition = !blocks[x][z - 1] || blocks[x][z - 1][y] === 0;
                        const leftCondition = (!blocks[x - 1] || !blocks[x - 1][z] || blocks[x - 1][z][y] === 0);
                        const rightCondition = (!blocks[x + 1] || !blocks[x + 1][z] || blocks[x + 1][z][y] === 0);
                        const topCondition = !blocks[x][z][y + 1] || blocks[x][z][y + 1] === 0;
                        const bottomCondition = !blocks[x][z][y - 1] || blocks[x][z][y - 1] === 0;
    
                        
                        if (frontCondition) {
                            if(!(z == Chunk.dimensions.z-1 && Chunk.Manager.GetChunk(this.x,this.y+1).GetPartialBlock(x,y,0))){
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
                            if(!(z == 0 && Chunk.Manager.GetChunk(this.x,this.y-1).GetPartialBlock(x,y,chunkDimensions.z-1))){
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
                            if(!(x == 0 && Chunk.Manager.GetChunk(this.x-1,this.y).GetPartialBlock(chunkDimensions.x-1,y,z))){
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
                            if(!(x == Chunk.dimensions.x-1 && Chunk.Manager.GetChunk(this.x+1,this.y).GetPartialBlock(0,y,z))){
                                var {positions,indices,uvs,normals} = block.right(x,y,z,m,iC);
                                
                                Array.prototype.push.apply(gpositions[3],positions);
                                Array.prototype.push.apply(aindicies,indices);
                                Array.prototype.push.apply(guvs[3],uvs);
                                Array.prototype.push.apply(gnormals[3],normals);
                                iC+=4;
                                gindices[3] += 6;
                            }
                        }

                        
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

        return {
            positions:pos,
            indices:aindicies,
            uvs:uv,
            normals:norm
        };
    }
    

    async GenerateAsync(){
        var posX = Chunk.dimensions.x*this.x;
        var posZ = Chunk.dimensions.z*this.y;

        for(let lx = 0; lx < Chunk.dimensions.x; lx++){
            this.blocks.push(new Array(Chunk.dimensions.z).fill(new Array(Chunk.dimensions.y).fill(0)));
            for(let lz = 0; lz < Chunk.dimensions.z; lz++){
    
                var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,-20,100));
                
                this.blocks[lx][lz] = this.blocks[lx][lz].map((_,i)=>(Chunk.dimensions.y*0.5-h)>i?1:0);
            }
        }

        this.generatedBlocks = true;
        //this.GenerateModel(Chunk.Manager.chunks);
        return this;
    }

    static async GenerateAsync(chunk,x,y){
        if(chunk == null) return;
        if(chunk.lifetime <= 0) {
            delete Chunk.Manager.chunks[x][y];
            return;
        }
        var posX = Chunk.dimensions.x*x;
        var posZ = Chunk.dimensions.z*y;

        for(let lx = 0; lx < Chunk.dimensions.x; lx++){
            chunk.blocks.push(new Array(Chunk.dimensions.z).fill(new Array(Chunk.dimensions.y).fill(0)));
            for(let lz = 0; lz < Chunk.dimensions.z; lz++){
    
                var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,Chunk.Manager.longFrom,Chunk.Manager.longTo));
                
                chunk.blocks[lx][lz] = chunk.blocks[lx][lz].map((_,i)=>(Chunk.dimensions.y*0.5-h)>i?1:0);
            }
        }

        chunk.generatedBlocks = true;
        //chunk.GenerateModel(Chunk.Manager.chunks);
    }

    Generate(){
        var posX = Chunk.dimensions.x*this.x;
        var posZ = Chunk.dimensions.z*this.y;

        for(let lx = 0; lx < Chunk.dimensions.x; lx++){
            this.blocks.push(new Array(Chunk.dimensions.z).fill(new Array(Chunk.dimensions.y).fill(0)));
            for(let lz = 0; lz < Chunk.dimensions.z; lz++){
    
                var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,Chunk.Manager.longFrom,Chunk.Manager.longTo));
                
                this.blocks[lx][lz] = this.blocks[lx][lz].map((val,i)=>(Chunk.dimensions.y*0.5-h)>i?1:0);
            }
        }

        this.generatedBlocks = true;
        //this.GenerateModel(Manager.chunks);
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
        if(x > 0 && x < Chunk.dimensions.x-1 && z > 0 && z < Chunk.dimensions.z-1) return false;
        switch(z){
            case 0:
                if(y < this.partialChunk[0][x]) return true;
                break;
            case Chunk.dimensions.z-1:
                if(y < this.partialChunk[1][x]) return true;
                break;
            default:
                switch(x){
                    case 0:
                        if(y < this.partialChunk[2][z]) return true;
                        break;
                    case Chunk.dimensions.x-1:
                        if(y < this.partialChunk[3][z]) return true;
                        break;
                }
        }
        return false;
    }

    GeneratePartial(){
        var posX = Chunk.dimensions.x*this.x;
        var posZ = Chunk.dimensions.z*this.y;

        var j = 0;
        for(let i = 0; i < 4; i++){
            for(let lx = 0; lx < Chunk.dimensions.x; lx++){
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
                var h0 = perlin((x)*0.09,(y)*0.09);
                var h1 = perlin((x)*0.015,(y)*0.015);
                var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,Chunk.Manager.longFrom,Chunk.Manager.longTo));
                this.partialChunk[i][lx] = Chunk.dimensions.y*0.5-h;
                j++;
            }
        }
    }
}

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
    tempIncreaseInterval = 50;
    growing = false;
    renderMethod = 1;
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
    
        switch(this.renderMethod){
            case 0:
                //* Printer method (left to right, top to bottom) Good ol reliable
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
                break;
            case 1:
                //* Timed dynamic printer method circle (left to right, top to bottom, radius gradually increases) good performance
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
                break;
            case 2:
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
                break;
            case 3:
                //* Spinny method (rotates for each radius) Looks cool but kinda bad performance
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
                break;
            case 4:
                //* Dynamic printer method (in waves for each radius) it doesn't work but bad performance
                for(let nr = 0; nr < r; ++nr){
                    for(let x = -nr; x <= nr; ++x){
                        for(let y = -nr; y <= nr; ++y){
                            //if(x > -nr && x < r && y > -nr && y < nr) continue;
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
                break;
        }
        /* Timed dynamic printer method square (left to right, top to bottom, radius gradually increases) good performance
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

    GetLod(x,y,scale){
        
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
class GameManager{
    static deltaTime;
    static gl;
}