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
function GenerateRandomTerrain(spacing,radius,playerPos,from,to){
    /**
     * @type {number[][]}
     */
    var gpositions = [];
    var gindices = [];
    var guvs = [];
    var gnormals = [];

    var iC = 0;
    var m = 1;

    var pRoundedX = Math.round(-playerPos[0]);
    var pRoundedY = Math.round(-playerPos[2]);

    for(let x = 0; x <= radius; x+=spacing){
        for(let y = 0; y <= radius; y+=spacing){
            if((x*x + y*y) > radius*radius){continue;}

            var aX = pRoundedX + x;
            var aY = pRoundedY + y;

            var h0 = perlin(aX*0.1,aY*0.1);
            var h = Math.round(clampBetween(h0,-1,1,from,to));
            var {positions, indices, uvs, normals} = block.top(aX,h,aY,m,iC);

            iC += 4;
            Array.prototype.push.apply(gpositions,positions);
            Array.prototype.push.apply(gindices,indices);
            Array.prototype.push.apply(guvs,uvs);
            Array.prototype.push.apply(gnormals,normals);
        }
    }

    return {
        positions: gpositions.flat(),
        indices: gindices,
        uvs: guvs,
        normals: gnormals,
    };
}

class Chunk{
    static seed = 0;
    static texture;
    static modelMatrixLocation;
    static shaderProgram;
    /**
     * @type {ChunkManager}
     */
    static Manager;

    lifetime = 60;
    modelLifetime = 5;

    generatedBlocks = false;
    generated = false;
    generating = false;
    modified = false;
    active = false;

    x;
    y;

    static dimensions = {x:16,y:256,z:16};

    gl;

    chunkMatrix = mat4.create();

    model = {
        front: {
            facing:[0,0,1],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        },
        back: {
            facing:[0,0,-1],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        },
        left: {
            facing:[-1,0,0],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        },
        right: {
            facing:[1,0,0],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        },
        top: {
            facing:[0,1,0],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        },
        bottom: {
            facing:[0,-1,0],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null
        }
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

        this.model.front.positionBuffer = gl.createBuffer();
        this.model.back.positionBuffer = gl.createBuffer();
        this.model.right.positionBuffer = gl.createBuffer();
        this.model.left.positionBuffer = gl.createBuffer();
        this.model.top.positionBuffer = gl.createBuffer();
        this.model.bottom.positionBuffer = gl.createBuffer();

        this.model.front.indexBuffer = gl.createBuffer();
        this.model.back.indexBuffer = gl.createBuffer();
        this.model.right.indexBuffer = gl.createBuffer();
        this.model.left.indexBuffer = gl.createBuffer();
        this.model.top.indexBuffer = gl.createBuffer();
        this.model.bottom.indexBuffer = gl.createBuffer();

        this.model.front.uvBuffer = gl.createBuffer();
        this.model.back.uvBuffer = gl.createBuffer();
        this.model.right.uvBuffer = gl.createBuffer();
        this.model.left.uvBuffer = gl.createBuffer();
        this.model.top.uvBuffer = gl.createBuffer();
        this.model.bottom.uvBuffer = gl.createBuffer();

        this.model.front.normalBuffer = gl.createBuffer();
        this.model.back.normalBuffer = gl.createBuffer();
        this.model.right.normalBuffer = gl.createBuffer();
        this.model.left.normalBuffer = gl.createBuffer();
        this.model.top.normalBuffer = gl.createBuffer();
        this.model.bottom.normalBuffer = gl.createBuffer();

        this.gl = gl;

        this.GeneratePartial();
    }

    // 3d array
    /**
     * @type {number[][][]}
     */
    blocks = []

    GenerateModel(){
        //console.log('generating');
        this.generateChunkModel();

        for(let face of Object.keys(this.model)){
            //console.log(this.model[face]);
            // Upload position data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model[face].positionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.model[face].positions), this.gl.STATIC_DRAW);
          
            // Upload index data
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model[face].indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model[face].indices), this.gl.STATIC_DRAW);
          
            // Upload UV data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model[face].uvBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.model[face].uvs), this.gl.STATIC_DRAW);
    
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.model[face].normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.model[face].normals), this.gl.STATIC_DRAW);
        }

        this.generated = true;
    }

    static GenerateModel(chunk){
        //console.log('generating');
        chunk.generateChunkModel();

        for(let face of Object.keys(chunk.model)){
            //console.log(this.model[face]);
            // Upload position data
            chunk.gl.bindBuffer(chunk.gl.ARRAY_BUFFER, chunk.model[face].positionBuffer);
            chunk.gl.bufferData(chunk.gl.ARRAY_BUFFER, new Float32Array(chunk.model[face].positions), chunk.gl.STATIC_DRAW);
          
            // Upload index data
            chunk.gl.bindBuffer(chunk.gl.ELEMENT_ARRAY_BUFFER, chunk.model[face].indexBuffer);
            chunk.gl.bufferData(chunk.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(chunk.model[face].indices), chunk.gl.STATIC_DRAW);
          
            // Upload UV data
            chunk.gl.bindBuffer(chunk.gl.ARRAY_BUFFER, chunk.model[face].uvBuffer);
            chunk.gl.bufferData(chunk.gl.ARRAY_BUFFER, new Float32Array(chunk.model[face].uvs), chunk.gl.STATIC_DRAW);
    
            chunk.gl.bindBuffer(chunk.gl.ARRAY_BUFFER,chunk.model[face].normalBuffer);
            chunk.gl.bufferData(chunk.gl.ARRAY_BUFFER, new Float32Array(chunk.model[face].normals), chunk.gl.STATIC_DRAW);
        }

        chunk.generated = true;
        chunk.generating = false;
    }

    RenderSide({positionBuffer, indexBuffer, uvBuffer, normalBuffer}, length){
        if(!this.generated) return 0;
        //console.log(positionBuffer,indexBuffer,uvBuffer,normalBuffer,length);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        //const positionAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'position');
        this.gl.enableVertexAttribArray(Chunk.positionAttributeLocation);
        this.gl.vertexAttribPointer(Chunk.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
        //const uvAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'uv');
        this.gl.enableVertexAttribArray(Chunk.uvAttributeLocation);
        this.gl.vertexAttribPointer(Chunk.uvAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        //var normalAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'normal');
        this.gl.enableVertexAttribArray(Chunk.normalAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.vertexAttribPointer(Chunk.normalAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        //this.gl.uniform1i(Chunk.textureLocation, 0);
        //this.gl.activeTexture(this.gl.TEXTURE0);
        //this.gl.bindTexture(this.gl.TEXTURE_2D, Chunk.texture);

        this.gl.uniformMatrix4fv(Chunk.modelMatrixLocation, false, this.chunkMatrix);

        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, length, this.gl.UNSIGNED_SHORT, 0, 1);
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

    Render(playerRot,viewMatrix,fieldOfView,aspectRatio){
        //console.log('trying to render', this.generated, this.x,this.y);
        if(!this.generating && !this.generated){
            this.generating = true;
            Chunk.Manager.StackModelGenEvent(Chunk.GenerateModel,this);
        }
        if(!this.generated) return 0;
        var n = 0;
        if(true || this.isInCameraView(viewMatrix,fieldOfView,aspectRatio)){

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

            if(renderFront) n+= this.RenderSide(this.model.front,this.model.front.indices.length);
            if(renderBack) n+= this.RenderSide(this.model.back,this.model.back.indices.length);
            if(renderLeft) n+= this.RenderSide(this.model.left,this.model.left.indices.length);
            if(renderRight) n+= this.RenderSide(this.model.right,this.model.right.indices.length);
            if(renderTop) n+= this.RenderSide(this.model.top,this.model.top.indices.length);
            if(renderBottom) n+= this.RenderSide(this.model.bottom,this.model.bottom.indices.length);
            /*
            for(let side of Object.values(this.model)){
                if(vec3.angle(side.facing,playerRot) > Math.PI*0.8) {console.log('face hidden');continue};
                this.RenderSide(
                    side,
                    side.indices.length);
            } /**/
        }
        //console.log('rendering',this.x,this.y);
        return n;
    }

    generateUnoptimizedChunkModel(cx,cy,chunks){
        var fiC = 0;
        var biC = 0;
        var liC = 0;
        var riC = 0;
        var tiC = 0;
        var boiC = 0;
        var m = 1;
    
        //console.log(this.blocks);
        for(var x = 0; x < this.blocks.length; x++){
            for(var z = 0; z < this.blocks[0].length; z++){
                for(var y = 0; y < this.blocks[0][0].length; y++){
                    if(this.blocks[x][z][y] != 0){
                        if(!(this.blocks[x][z + 1] && this.blocks[x][z + 1][y] != 0)){ // front
                            if(!(z+1 == Chunk.dimensions.z && chunks[cx] && chunks[cx][cy+1] && chunks[cx][cy+1].blocks[x] && chunks[cx][cy+1].blocks[x][0][y] != 0)){
                                var {positions,indices,uvs,normals} = block.front(x,y,z,m,fiC);
                                
                                Array.prototype.push.apply(this.model.front.positions,positions);
                                Array.prototype.push.apply(this.model.front.indices,indices);
                                Array.prototype.push.apply(this.model.front.uvs,uvs);
                                Array.prototype.push.apply(this.model.front.normals,normals);
                                fiC+=4;
                            }
                        }
                        if(!(this.blocks[x][z - 1] && this.blocks[x][z - 1][y] != 0)){ // back
                            if(!(z == 0 && chunks[cx] && chunks[cx][cy-1] && chunks[cx][cy-1].blocks[x] && chunks[cx][cy-1].blocks[x][Chunk.dimensions.z-1][y] != 0)){
                                var {positions,indices,uvs,normals} = block.back(x,y,z,m,biC);
                                
                                Array.prototype.push.apply(this.model.back.positions,positions);
                                Array.prototype.push.apply(this.model.back.indices,indices);
                                Array.prototype.push.apply(this.model.back.uvs,uvs);
                                Array.prototype.push.apply(this.model.back.normals,normals);
                                biC+=4;
                            }
                        }
                        if(!(this.blocks[x - 1] && this.blocks[x - 1][z] && this.blocks[x - 1] && this.blocks[x - 1][z][y] != 0)){ // left
                            if(!(x == 0 && chunks[cx-1] && chunks[cx-1][cy] && chunks[cx-1][cy].blocks[Chunk.dimensions.x-1] &&chunks[cx-1][cy].blocks[Chunk.dimensions.x-1][z][y] != 0)){
                                var {positions,indices,uvs,normals} = block.left(x,y,z,m,liC);
                                
                                Array.prototype.push.apply(this.model.left.positions,positions);
                                Array.prototype.push.apply(this.model.left.indices,indices);
                                Array.prototype.push.apply(this.model.left.uvs,uvs);
                                Array.prototype.push.apply(this.model.left.normals,normals);
                                liC+=4;
                            }
                        }
                        if(!(this.blocks[x + 1] && this.blocks[x + 1][z] && this.blocks[x + 1] && this.blocks[x + 1][z][y] != 0)){ // right
                            if(!(x+1 == Chunk.dimensions.x && chunks[cx+1] && chunks[cx+1][cy] && chunks[cx+1][cy].blocks[0] && chunks[cx+1][cy].blocks[0][z][y] != 0)){
                                var {positions,indices,uvs,normals} = block.right(x,y,z,m,riC);
                                
                                Array.prototype.push.apply(this.model.right.positions,positions);
                                Array.prototype.push.apply(this.model.right.indices,indices);
                                Array.prototype.push.apply(this.model.right.uvs,uvs);
                                Array.prototype.push.apply(this.model.right.normals,normals);
                                riC+=4;
                            }
                        }
                        if(!(this.blocks[x][z][y+1] && this.blocks[x][z][y+1] != 0)){ // top
                            var {positions,indices,uvs,normals} = block.top(x,y,z,m,tiC);
                                
                            Array.prototype.push.apply(this.model.top.positions,positions);
                            Array.prototype.push.apply(this.model.top.indices,indices);
                            Array.prototype.push.apply(this.model.top.uvs,uvs);
                            Array.prototype.push.apply(this.model.top.normals,normals);
                            tiC+=4;
                        }
                        if(!(this.blocks[x][z][y-1] && this.blocks[x][z][y-1] != 0)){ // bottom
                            var {positions,indices,uvs,normals} = block.bottom(x,y,z,m,boiC);
                                
                            Array.prototype.push.apply(this.model.bottom.positions,positions);
                            Array.prototype.push.apply(this.model.bottom.indices,indices);
                            Array.prototype.push.apply(this.model.bottom.uvs,uvs);
                            Array.prototype.push.apply(this.model.bottom.normals,normals);
                            boiC+=4;
                        }
                    }
                }
            }
        }
    }

    generateChunkModel() {
        //console.log('generating')
        const blocks = this.blocks;
        const model = this.model;
        const chunkDimensions = Chunk.dimensions;
        const m = 1;

        var fiC = 0;
        var biC = 0;
        var liC = 0;
        var riC = 0;
        var tiC = 0;
        var boiC = 0;
    
        for (let x = 0; x < blocks.length; x++) {
            for (let z = 0; z < blocks[0].length; z++) {
                for (let y = 0; y < blocks[0][0].length; y++) {
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
                                var {positions,indices,uvs,normals} = block.front(x,y,z,m,fiC);
                                
                                Array.prototype.push.apply(this.model.front.positions,positions);
                                Array.prototype.push.apply(this.model.front.indices,indices);
                                Array.prototype.push.apply(this.model.front.uvs,uvs);
                                Array.prototype.push.apply(this.model.front.normals,normals);
                                fiC+=4;
                            }
                        }
    
                        if (backCondition) {
                            if(!(z == 0 && Chunk.Manager.GetChunk(this.x,this.y-1).GetPartialBlock(x,y,chunkDimensions.z-1))){
                                var {positions,indices,uvs,normals} = block.back(x,y,z,m,biC);
                                
                                Array.prototype.push.apply(this.model.back.positions,positions);
                                Array.prototype.push.apply(this.model.back.indices,indices);
                                Array.prototype.push.apply(this.model.back.uvs,uvs);
                                Array.prototype.push.apply(this.model.back.normals,normals);
                                biC+=4;
                            }
                        }
    
                        if (leftCondition) {
                            if(!(x == 0 && Chunk.Manager.GetChunk(this.x-1,this.y).GetPartialBlock(chunkDimensions.x-1,y,z))){
                                var {positions,indices,uvs,normals} = block.left(x,y,z,m,liC);
                                
                                Array.prototype.push.apply(this.model.left.positions,positions);
                                Array.prototype.push.apply(this.model.left.indices,indices);
                                Array.prototype.push.apply(this.model.left.uvs,uvs);
                                Array.prototype.push.apply(this.model.left.normals,normals);
                                liC+=4;
                            }
                        }
    
                        if (rightCondition) {
                            if(!(x == Chunk.dimensions.x-1 && Chunk.Manager.GetChunk(this.x+1,this.y).GetPartialBlock(0,y,z))){
                                var {positions,indices,uvs,normals} = block.right(x,y,z,m,riC);
                                
                                Array.prototype.push.apply(this.model.right.positions,positions);
                                Array.prototype.push.apply(this.model.right.indices,indices);
                                Array.prototype.push.apply(this.model.right.uvs,uvs);
                                Array.prototype.push.apply(this.model.right.normals,normals);
                                riC+=4;
                            }
                        }
    
                        if (topCondition) {
                            var {positions,indices,uvs,normals} = block.top(x,y,z,m,tiC);
                                
                            Array.prototype.push.apply(this.model.top.positions,positions);
                            Array.prototype.push.apply(this.model.top.indices,indices);
                            Array.prototype.push.apply(this.model.top.uvs,uvs);
                            Array.prototype.push.apply(this.model.top.normals,normals);
                            tiC+=4;
                        }
    
                        if (bottomCondition) {
                            var {positions,indices,uvs,normals} = block.bottom(x,y,z,m,boiC);
                                
                            Array.prototype.push.apply(this.model.bottom.positions,positions);
                            Array.prototype.push.apply(this.model.bottom.indices,indices);
                            Array.prototype.push.apply(this.model.bottom.uvs,uvs);
                            Array.prototype.push.apply(this.model.bottom.normals,normals);
                            boiC+=4;
                        }
                    }
                }
            }
        }
        this.model = model;
    }
    

    async GenerateAsync(){
        var posX = Chunk.dimensions.x*this.x;
        var posZ = Chunk.dimensions.z*this.y;

        for(let lx = 0; lx < Chunk.dimensions.x; lx++){
            this.blocks.push(new Array(Chunk.dimensions.z).fill(new Array(Chunk.dimensions.y).fill(0)));
            for(let lz = 0; lz < Chunk.dimensions.z; lz++){
    
                var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,0,50));
                
                this.blocks[lx][lz] = this.blocks[lx][lz].map((_,i)=>(Chunk.dimensions.y*0.5-h)>i?1:0);
            }
        }

        this.generatedBlocks = true;
        //this.GenerateModel(Chunk.Manager.chunks);
        return this;
    }

    static async GenerateAsync(chunk,x,y){
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

    static Generate(chunk,x,y){
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
            v.lifetime-=deltaTime;
        });

        this.finished = false;

        this.ExecuteEvents(deltaTime)
        .then(()=>{
            this.finished = true;
            this.#hasChanged = true;
        });
    }

    async ExecuteEvents(deltaTime){
        var timeSpent = 0;
        var lastTimeSpent = 0;
        var evc = 0;

        while(!this.finished && this.eventStack.length != 0 && 33 > (timeSpent + lastTimeSpent)){
            let startTime = Date.now();
            var next = this.eventStack.shift();

            let chunk = await next.fire();
            //console.log(chunk);
            timeSpent += lastTimeSpent = (Date.now()-startTime);
            evc++;
        }
        //console.log(timeSpent,evc);
    }

    async RenderChunksWithin(plController,viewMatrix,fieldOfView,aspectRatio){
        var n = 0;
        let playerPos = plController.GetPosition();
        var r = this.radius;
        var pRoundedX = Math.round((-playerPos[0]-Chunk.dimensions.x*0.5)/Chunk.dimensions.x);
        var pRoundedY = Math.round((-playerPos[2]-Chunk.dimensions.z*0.5)/Chunk.dimensions.z);
    
        for(let x = -r; x <= r; x++){
            for(let y = -r; y <= r; y++){
                if((x*x + y*y) > r*r){continue;}
                //console.log(pRoundedX+x,pRoundedY+y);
    
                let chunk = this.GetChunk(pRoundedX+x,pRoundedY+y);
                chunk.active = true;
                var {x:rx,y:ry} = plController.GetRotation();
                var direction = [
                    Math.round(Math.cos(ry) * Math.cos(rx)),
                    Math.round(Math.sin(rx)),
                    Math.round(Math.sin(ry) * Math.cos(rx))
                ];
                n+=chunk.Render(direction,viewMatrix,fieldOfView,aspectRatio);
            }
        }
        return n;

        /*
        if(this.ChunkArray.length > this.maxSavedChunks){
            var length = this.ChunkArray.length;
            this.ChunkArray.sort((a,b)=>a.lifetime - b.lifetime);
            let arr = this.ChunkArray.map((v)=>v);
            for(let chunk of arr){
                if(length <= this.maxSavedChunks)break;
                if(chunk.active)continue;

                (()=>delete this.chunks[chunk.x][chunk.y])();
                length--;
                //console.log('deleting chunk at',chunk.x,chunk.y);
            }
        }/**/
    }

    GetChunk(x,y){
        if(this.chunks[x] && this.chunks[x][y]){
            var chunk = this.chunks[x][y];
            if(chunk.modified){
                chunk.modified = false;
                this.eventStack.push(new GameEvent(Chunk.GenerateAsync,chunk,x,y));
            }
            return chunk;
        }else{
            var chunk = new Chunk(x,y,ChunkManager.gl);
            if(!this.chunks[x]) this.chunks[x] = {};
            this.chunks[x][y] = chunk;
            this.eventStack.push(new GameEvent(Chunk.GenerateAsync,chunk,x,y));
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

function GenerateRandomChunk(x,y,from,to,gl){
    var chunk = new Chunk(x,y,gl);

    chunk.Generate(x,y,from,to);

    return chunk;
}

function GenerateRandomChunkAsync(x,y,from,to,gl){
    var chunk = new Chunk(x,y,gl);

    chunk.GenerateAsync(x,y,from,to);

    return chunk;
}

/**
     * 
     * @param {bool[][][]} grid 
     * @param {number} cx 
     * @param {number} cy 
     * @param {Chunk[][]} chunks 
     * @param {[number,number]} playerDirection 
     * @returns 
     */
function generateUnoptimizedChunkModel(grid,cx,cy,chunks){
    var positions = [];
    var indices = [];
    var uvs = [];
    var normals = [];

    var iC = 0;
    var m = 1;

    for(var x = 0; x < grid.length; x++){
        for(var z = 0; z < grid[0].length; z++){
            for(var y = 0; y < grid[0][0].length; y++){
                if(grid[x][z][y] != 0){
                    if(!(grid[x][z + 1] && grid[x][z + 1][y] != 0)){ // front
                        if(chunks[cx+1] && chunks[cx+1][cy].blocks[0]) ;
                        let front = [
                            x, y -m, z +m,
                            x +m, y -m, z +m,
                            x +m, y, z +m,
                            x, y, z +m,
                        ];
            
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,front);
                        uvs.push(
                            0,0,
                            1,0,
                            1,1,
                            0,1,
                        );
                        normals.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0);
                    }
                    if(!(grid[x][z - 1] && grid[x][z - 1][y] != 0)){ // back
                        let back = [
                            x, y -m, z,
                            x, y, z,
                            x +m, y, z,
                            x +m, y -m, z,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,back);
                        uvs.push(
                            1,0,
                            0,0,
                            0,1,
                            1,1,
                        );
                        normals.push(0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0);
                    }
                    if(!(grid[x - 1] && grid[x - 1][z] && grid[x - 1][z][y] != 0)){ // left
                        let left = [
                            x, y -m, z,
                            x, y -m, z +m,
                            x, y, z +m,
                            x, y, z,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,left);
                        uvs.push( // TODO
                            0,0,
                            1,0,
                            1,1,
                            0,1,
                        );
                        normals.push(-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
                    }
                    if(!(grid[x + 1] && grid[x + 1][z] && grid[x + 1][z][y] != 0)){ // right
                        let right = [
                            x +m, y -m, z,
                            x +m, y, z,
                            x +m, y, z +m,
                            x +m, y -m, z +m,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,right);
                        uvs.push( // TODO
                            1,0,
                            1,1,
                            0,1,
                            0,0,
                        );
                        normals.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
                    }
                    if(!(grid[x][z][y+1] && grid[x][z][y+1] != 0)){ // top
                        let top = [
                            x, y, z,
                            x, y, z +m,
                            x +m, y, z +m,
                            x +m, y, z,
                        ];
                        
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
                        
                        Array.prototype.push.apply(positions,top);
                        uvs.push(
                            0,1,
                            1,1,
                            1,0,
                            0,0,
                        );
                        normals.push(0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0);
                    }
                    if(!(grid[x][z][y-1] && grid[x][z][y-1] != 0)){ // bottom
                        let bottom = [
                            x, y -m, z,
                            x +m, y -m, z,
                            x +m, y -m, z +m,
                            x, y -m, z +m,
                        ];
                        
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
                        
                        Array.prototype.push.apply(positions,bottom);
                        uvs.push(
                            1,1,
                            0,1,
                            0,0,
                            1,0,
                        );
                        normals.push(0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0);
                    }
                }
            }
        }
    }

    return {
        positions: positions,
        indices: indices,
        uvs: uvs,
        normals: normals,
    };
}

/**
     * 
     * @param {bool[][][]} grid 
     * @returns 
     */
function generateUnoptimizedModel(grid){
    var positions = [];
    var indices = [];
    var uvs = [];
    var normals = [];

    var iC = 0;
    var m = 1;

    for(var x = 0; x < grid.length; x++){
        for(var z = 0; z < grid[0].length; z++){
            for(var y = 0; y < grid[0][0].length; y++){
                if(grid[x][z][y] != 0){
                    if(!(grid[x][z + 1] && grid[x][z + 1][y] != 0)){ // front
                        let front = [
                            x, y -m, z +m,
                            x +m, y -m, z +m,
                            x +m, y, z +m,
                            x, y, z +m,
                        ];
            
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,front);
                        uvs.push(
                            0,0,
                            1,0,
                            1,1,
                            0,1,
                        );
                        normals.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0);
                    }
                    if(!(grid[x][z - 1] && grid[x][z - 1][y] != 0)){ // back
                        let back = [
                            x, y -m, z,
                            x, y, z,
                            x +m, y, z,
                            x +m, y -m, z,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,back);
                        uvs.push(
                            1,0,
                            0,0,
                            0,1,
                            1,1,
                        );
                        normals.push(0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0);
                    }
                    if(!(grid[x - 1] && grid[x - 1][z] && grid[x - 1][z][y] != 0)){ // left
                        let left = [
                            x, y -m, z,
                            x, y -m, z +m,
                            x, y, z +m,
                            x, y, z,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,left);
                        uvs.push( // TODO
                            0,0,
                            1,0,
                            1,1,
                            0,1,
                        );
                        normals.push(-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
                    }
                    if(!(grid[x + 1] && grid[x + 1][z] && grid[x + 1][z][y] != 0)){ // right
                        let right = [
                            x +m, y -m, z,
                            x +m, y, z,
                            x +m, y, z +m,
                            x +m, y -m, z +m,
                        ];
            
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
            
                        Array.prototype.push.apply(positions,right);
                        uvs.push( // TODO
                            1,0,
                            1,1,
                            0,1,
                            0,0,
                        );
                        normals.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
                    }
                    if(!(grid[x][z][y+1] && grid[x][z][y+1] != 0)){ // top
                        let top = [
                            x, y, z,
                            x, y, z +m,
                            x +m, y, z +m,
                            x +m, y, z,
                        ];
                        
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
                        
                        Array.prototype.push.apply(positions,top);
                        uvs.push(
                            0,1,
                            1,1,
                            1,0,
                            0,0,
                        );
                        normals.push(0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0);
                    }
                    if(!(grid[x][z][y-1] && grid[x][z][y-1] != 0)){ // bottom
                        let bottom = [
                            x, y -m, z,
                            x +m, y -m, z,
                            x +m, y -m, z +m,
                            x, y -m, z +m,
                        ];
                        
                        indices.push(
                            iC,iC+1,iC+2,iC,iC+2,iC+3,
                        );
                        iC+=4;
                        
                        Array.prototype.push.apply(positions,bottom);
                        uvs.push(
                            1,1,
                            0,1,
                            0,0,
                            1,0,
                        );
                        normals.push(0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0);
                    }
                }
            }
        }
    }

    return {
        positions: positions,
        indices: indices,
        uvs: uvs,
        normals: normals,
    };
}