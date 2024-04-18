class Chunk{
    static active = 0;
    static seed = 0;
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

    x;
    y;

    static dimensions = {x:16,y:256,z:16};

    gl;

    chunkMatrix = mat4.create();

    modelChunkSize = 128;

    model = {
        lods:[
            {
                positionBuffer:null,
                indexBuffer:null,
                uvBuffer:null,
                normalBuffer:null,
            }
        ],
        front: {
            facing:[0,0,1],
            positions:[],
            indices:[],
            uvs:[],
            normals:[],
            positionBuffer:null,
            indexBuffer:null,
            uvBuffer:null,
            normalBuffer:null,
            offset:0,
            length:0
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
            normalBuffer:null,
            offset:0,
            length:0
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
            normalBuffer:null,
            offset:0,
            length:0
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
            normalBuffer:null,
            offset:0,
            length:0
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
            normalBuffer:null,
            offset:0,
            length:0
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
            normalBuffer:null,
            offset:0,
            length:0
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

        this.model.positionBuffer = gl.createBuffer();
        this.model.indexBuffer = gl.createBuffer();
        this.model.uvBuffer = gl.createBuffer();
        this.model.normalBuffer = gl.createBuffer();

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

    Dispose(){
        for(let face of Object.keys(this.model)){
            this.gl.deleteBuffer(this.model[face].positionBuffer);
            this.gl.deleteBuffer(this.model[face].indexBuffer);
            this.gl.deleteBuffer(this.model[face].uvBuffer);
            this.gl.deleteBuffer(this.model[face].normalBuffer);
        }
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
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Int16Array(this.model[face].positions), this.gl.STATIC_DRAW);
          
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
        if(chunk.lifetime <= 0){
            delete Chunk.Manager.chunks[chunk.x][chunk.y];
        }
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
        const positionAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'position');
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
        const uvAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'uv');
        this.gl.enableVertexAttribArray(uvAttributeLocation);
        this.gl.vertexAttribPointer(uvAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        var normalAttributeLocation = this.gl.getAttribLocation(Chunk.shaderProgram, 'normal');
        this.gl.enableVertexAttribArray(normalAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.vertexAttribPointer(normalAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        this.gl.uniform1i(Chunk.textureLocation, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, Chunk.texture);

        this.gl.uniformMatrix4fv(Chunk.modelMatrixLocation, false, this.chunkMatrix);

        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, length, this.gl.UNSIGNED_SHORT, 0, 1);
        return length;
    }

    static radius = 8;
    dotT = document.getElementById('dotT');

    isInCameraView(viewMatrix, fieldOfView, aspectRatio) {
        // Convert fieldOfView to radians
        var f = fieldOfView * (Math.PI / 180);
    
        // Extract camera position and rotation
        var cameraPos = vec3.create();
        mat4.getTranslation(cameraPos, viewMatrix);
        
        var chunkPosition = vec3.create();
        mat4.getTranslation(chunkPosition,this.chunkMatrix);
        var ownPosition = vec3.fromValues(chunkPosition[0]+8,cameraPos[1],chunkPosition[2]+8);
    
        // Calculate camera direction
        var cD = PlayerController.NormalizedRotation({bx:0,by:-1.570796});
        var cameraDirection = vec3.fromValues(cD[0],0,cD[2]);
        vec3.normalize(cameraDirection,cameraDirection);

        var line = vec3.create();
        vec3.subtract(line,chunkPosition,cameraPos);
        vec3.normalize(line,line);

        var p = vec3.angle(line,cameraDirection);

        this.dotT.innerText = f + '   ' + p + '   ' + vec3.str(line) + '   ' + vec3.str(cameraDirection);

        return p < fieldOfView;
    }

    Render(playerRot,viewMatrix,fieldOfView,aspectRatio){
        //console.log('trying to render', this.generated, this.x,this.y);
        if(!this.generatedBlocks && !this.generatingBlocks) {
            this.generatingBlocks = true;
            Chunk.Manager.eventStack.push(new GameEvent(Chunk.GenerateAsync,this,this.x,this.y));
        }
        if(!this.generating && !this.generated && this.generatedBlocks){
            this.generating = true;
            Chunk.Manager.StackModelGenEvent(Chunk.GenerateModel,this);
        }
        if(!this.generated || !this.generatedBlocks) return 0;
        var n = 0;
        if(this.isInCameraView(viewMatrix,fieldOfView,aspectRatio)){

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
            Chunk.active++;
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

    GenerateLod(quality){

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
                
                this.blocks[lx][lz].forEach((_,i,arr)=>arr[i] = (Chunk.dimensions.y*0.5-h)>i?1:0);
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
    
                //var h0 = perlin((posX+lx)*0.09,(posZ+lz)*0.09);
                var h1 = perlin((posX+lx)*0.015,(posZ+lz)*0.015);
                //var h = Math.round(clampBetween(h0,-1,1,Chunk.Manager.shortFrom,Chunk.Manager.shortTo))+Math.round(clampBetween(h1,-1,1,Chunk.Manager.longFrom,Chunk.Manager.longTo));
                var h = Math.round(clampBetween(h1,-1,1,Chunk.Manager.longFrom,Chunk.Manager.longTo));
                
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