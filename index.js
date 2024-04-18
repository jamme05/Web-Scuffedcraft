/**
 * @type {ChunkManager}
 */
var chunkManager;
(async () => {
    'use strict';

    /**
     * @type {HTMLCanvasElement}
     */
    const display = document.getElementById('display');
    const fpsDisplayer = document.getElementById('fps');
    const cordsDisplayer = document.getElementById('cords');
    const directionDisplayer = document.getElementById('direction');
    const verticieDisplayer = document.getElementById('verticies');
    display.width = window.innerWidth;
    display.height = window.innerHeight;

    const gl = display.getContext('webgl2');
    GameManager.gl = gl;

    var isWebGL2 = !!gl;
    if (!isWebGL2) {
        document.body.style.backgroundColor = 'red';
    }

    var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));
    // Get the uniform locations
    var projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
    var viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix');
    
    var modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix');

    var textureLocation = gl.getUniformLocation(program, 'textureSampler');
    var colorMapLocation = gl.getUniformLocation(program, 'colorMapSampler');

    var lightDirectionLocation = gl.getUniformLocation(program, 'lightDirection');
    var ambientColorLocation = gl.getUniformLocation(program, 'ambientColor');
    var flashlightPositionLocation = gl.getUniformLocation(program, 'flashlightPosition');
    var flashlightDirectionLocation = gl.getUniformLocation(program, 'flashlightDirection');
    var useNoiseLocation = gl.getUniformLocation(program, 'useNoise');
    var currentNoiseLocation = gl.getUniformLocation(program, 'currentNoise');
    
    var isLineLocation = gl.getUniformLocation(program,'isLine');

    Chunk.modelMatrixLocation = modelMatrixLocation;
    Chunk.shaderProgram = program;
    Chunk.textureLocation = textureLocation;
    Chunk.isLineLocation = isLineLocation;

    var cManager = new ChunkManager(gl,12,64,3);
    chunkManager = cManager;
    // -- Init Texture

    gl.useProgram(Chunk.shaderProgram);
    var imageUrl = 'textures/block/grass_block_top.png';
    var texture = gl.createTexture();
    loadImage(imageUrl, function (image) {
        // -- Init 2D Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // -- Allocate storage for the texture
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 16, 16);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

        requestAnimationFrame(render);
    });
    Chunk.texture = texture;
    imageUrl = 'textures/colormap/grass.png';
    var textureG = gl.createTexture();
    loadImage(imageUrl, function (image) {
        // -- Init 2D Texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureG);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // -- Allocate storage for the texture
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 256, 256);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

        gl.uniform1i(Chunk.textureLocation, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Chunk.texture);
    });
    //var modelMatrix = mat4.create();
    //mat4.translate(modelMatrix,modelMatrix, [0,-5,0]);/**/

    var lightDirection = vec3.fromValues(0.1, 0.1, 0.1);
    var ambient = vec3.fromValues(0.1,0.1,0.1);

    var viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0,0.0,5.0]);
    var perspectiveMatrix = mat4.create();
    var fieldOfView = 95;
    var aspectRatio = display.width/display.height;
    mat4.perspective(perspectiveMatrix, fieldOfView, aspectRatio, 0.1, 10000);

    var plController = new PlayerController(viewMatrix);
    display.addEventListener('click',async ()=>{
        display.requestPointerLock();
    });
    document.addEventListener('pointerlockchange',()=>{
        if(document.pointerLockElement === display) {
            plController.Enable();
        }
        else {
            plController.Disable();
        }
    });

    var delay = 0;
    var lastFrameTime = Date.now();

    //console.log(chunk.positions,chunk.indices,chunk.uvs,chunk.normals);

    /*
    for(let x of Object.keys(chunks)){
        for(let y of Object.keys(chunks[x]))
        chunks[x][y].GenerateModel(chunks);
    }/**/
    function render() {
        var newFrameTime = Date.now();
        var deltaTime = (newFrameTime-lastFrameTime)*0.001;
        GameManager.deltaTime = deltaTime;
        plController.updateCamera(deltaTime);
        lastFrameTime = newFrameTime;
        //console.log(1/deltaTime);
        //mat4.rotateY(modelMatrix, modelMatrix, 0.05*deltaTime);
        //mat4.rotateX(modelMatrix, modelMatrix, 0.1*deltaTime);
        //mat4.translate(modelMatrix,modelMatrix,[0.1*deltaTime,0,0]);

        /*
        delay += deltaTime;
        
        if(delay > 1000){
            grid[0].push(grid[0][0]);
            grid[1].push(grid[0][0]);
            var d = generateModel(grid);
            positions = d.positions;
            indices = d.indices;
            uvCoordinates = d.uvs;

            updateModel(positions,indices,uvCoordinates);

            delay = 0;
        }/**/

        //var {positions,indices,uvs,normals} = GenerateRandomTerrain(1,30,plController.GetPosition(),0,5);
        //updateModel(positions,indices,uvs,normals);

        // -- Render
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.cullFace(gl.BACK);

        //mat4.rotateX(modelMatrix, modelMatrix, -0.005 * Math.PI);

        gl.useProgram(Chunk.shaderProgram);

        //gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
        // Set uniforms
        gl.uniform1fv(currentNoiseLocation,[Math.random()]);

        var aspectRatio = display.width/display.height;
        mat4.perspective(perspectiveMatrix, fieldOfView, aspectRatio, 0.1, 1000);    
        gl.uniformMatrix4fv(projectionMatrixLocation, false, perspectiveMatrix)
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

        gl.uniform3fv(lightDirectionLocation, lightDirection);
        gl.uniform3fv(ambientColorLocation, ambient);

        gl.uniform1i(useNoiseLocation,false);
        var flashLightPosition = vec3.create();
        //mat4.getTranslation(flashLightPosition,viewMatrix);
        vec3.normalize(flashLightPosition,plController.GetPosition());
        gl.uniform3fv(flashlightPositionLocation,flashLightPosition);
        //console.log(plController.GetPosition(),flashLightPosition);
        var {x,y} = plController.GetRotation();
        var direction = [
            Math.cos(y) * Math.cos(x),
            Math.sin(x),
            Math.sin(y) * Math.cos(x)
        ];

        fpsDisplayer.innerText = (Math.round(100/deltaTime)*0.01).toFixed(1);
        cordsDisplayer.innerText = (-plController.GetPosition()[0]).toFixed(1) + ' ' + (-plController.GetPosition()[1]).toFixed(1) + ' ' + (-plController.GetPosition()[2]).toFixed(1);
        directionDisplayer.innerText = (direction[0].toFixed(1)) + ' ' + (direction[1].toFixed(1)) + ' ' + (direction[2].toFixed(1));
        
        var flashlightDirection = vec3.create();
        vec3.normalize(flashlightDirection,direction);
        gl.uniform3fv(flashlightDirectionLocation,direction);

        gl.uniform1i(colorMapLocation,1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureG);

        // Draw
        cManager.Clock(deltaTime);
        cManager.RenderChunksWithin(plController,viewMatrix,fieldOfView,aspectRatio)
        .then(n=>{verticieDisplayer.innerText=n});

        if(!plController.Paused) requestAnimationFrame(render);
    }
})();