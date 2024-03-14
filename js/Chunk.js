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
            if(r < 5) Chunk.Manager.StackChunkEvent('GenerateModel',this);
            else Chunk.Manager.StackChunkEvent('GenerateLOD1Model',this);
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

            if(renderFront) n+= this.RenderSide(0,model.front.length);
            if(renderBack) n+= this.RenderSide(model.back.index,model.back.length);
            if(renderLeft) n+= this.RenderSide(model.left.index,model.left.length);
            if(renderRight) n+= this.RenderSide(model.right.index,model.right.length);
            if(renderTop) n+= this.RenderSide(model.top.index,model.top.length);
            if(renderBottom) n+= this.RenderSide(model.bottom.index,model.bottom.length);
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