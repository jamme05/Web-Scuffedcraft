/*
    var width = 1;
    var height = 1;
    var depth = 1;

    var mW = 0.5 * width;
    var mH = 0.5 * height;
    var mD = 0.5 * depth;
    // -- Init geometries
    var positions = new Float32Array([
        // Front face
        -mW, -mH, mD,
        mW, -mH, mD,
        mW, mH, mD,
        -mW, mH, mD,

        // Back face
        -mW, -mH, -mD,
        -mW, mH, -mD,
        mW, mH, -mD,
        mW, -mH, -mD,

        // Top face
        -mW, mH, -mD,
        -mW, mH, mD,
        mW, mH, mD,
        mW, mH, -mD,

        // Bottom face
        -mW, -mH, -mD,
        mW, -mH, -mD,
        mW, -mH, mD,
        -mW, -mH, mD,

        // Right face
        mW, -mH, -mD,
        mW, mH, -mD,
        mW, mH, mD,
        mW, -mH, mD,

        // Left face
        -mW, -mH, -mD,
        -mW, -mH, mD,
        -mW, mH, mD,
        -mW, mH, -mD
    ]);

    var indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23    // left
    ];

    var uvW = 1.0 * width;
    var uvH = 1.0 * height;
    var uvD = 1.0 * depth;
    var uvCoordinates = [
        // Front face
        0.0, 0.0,
        uvW, 0.0,
        uvW, uvH,
        0.0, uvH,
      
        // Back face
        uvH, 0.0,
        0.0, 0.0,
        0.0, uvW,
        uvH, uvW,
      
        // Top face
        0.0, uvW,
        uvD, uvW,
        uvD, 0.0,
        0.0, 0.0,
      
        // Bottom face
        uvW, uvD,
        0.0, uvD,
        0.0, 0.0,
        uvW, 0.0,
      
        // Right face
        uvD, 0.0,
        uvD, uvH,
        0.0, uvH,
        0.0, 0.0,
      
        // Left face
        0.0, 0.0,
        uvD, 0.0,
        uvD, uvH,
        0.0, uvH
    ];/**/
    /*
    var positions = new Float32Array([
        -0.5, -1.0, 0.5, // 0
        0.5, -1.0, 0.5,  // 1
        0.5, 1.0, 0.5,   // 2
        -0.5, 1.0, 0.5,  // 3

        -0.5, -1.0, 0.5, // 4
        -0.5, -1.0, 1.5, // 5
        0.5, -1.0, 1.5,  // 6
        0.5, -1.0, 0.5,  // 7
    ]);
    var indices = [
        0, 1, 2, 0, 2, 3, // Front
        4, 5, 6, 4, 6, 7, // bottom
    ];

    var uvCoordinates = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 2.0,
        0.0, 2.0,

        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
    ]/**/
    /*
    var positions = new Float32Array([
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ]);

    var indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23    // left
    ];

    var uvCoordinates = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
      
        // Back face
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
      
        // Top face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
      
        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
      
        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
      
        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];/**/

/**
     * 
     * @param {bool[][][]} grid 
     * @returns 
     */
function generateModel(grid) {
    var positions = [];
    var indices = [];
    var uvs = [];

    var iC = 0;
    var m = 1;
    /**
         * @type {{x:number,y:number,z:number}[][]}
         */
    var frontBoxes = [

    ];
    var currentTopBox = 0;
        /**
         * @type {{x:number,y:number,z:number}[][]}
         */
        var topBoxes = [
        ];
    var currentFrontBox = 0;
    
    for (let y = 0; y < grid.length; y++) {
        let lastActiveInRow = null;

        for(let x = 0; x < grid[y].length; x++){
            let rowBreak = false;
            let currentLast = null;
            let firstActive = null;

            for(let z = 0; z < grid[y][x].length; z++){
                if(grid[y][x][z]){
                    if(!grid[y][x][z+1]){
                        frontBoxes.push(
                            [{x,y,z},{x,y,z}]
                        );
                    }
                    if(y+1 < grid.length)if(grid[y+1][x][z]){
                        rowBreak = true;
                        if(lastActiveInRow && topBoxes[currentTopBox]){
                            if(topBoxes[currentTopBox][1].z != lastActiveInRow.z){
                                topBoxes[currentTopBox][1] = lastActiveInRow;
                                currentTopBox = topBoxes.length;
                                topBoxes[currentTopBox] = [firstActive,currentLast];
                            }
                        }
                        
                        currentTopBox = topBoxes.length;
                        continue;
                    
                    }
                    
                    if(firstActive == null) firstActive = {x,y,z};

                    if(topBoxes.length == currentTopBox){
                        topBoxes[currentTopBox] = [{x,y,z},{x,y,z}];
                    }else{
                        topBoxes[currentTopBox][1] = {x,y,z};
                    }
                    currentLast = {x,y,z};
                }else{
                    rowBreak = true;
                    if(lastActiveInRow && topBoxes[currentTopBox]){
                        if(topBoxes[currentTopBox][1].z != lastActiveInRow.z){
                            topBoxes[currentTopBox][1] = lastActiveInRow;
                            currentTopBox = topBoxes.length;
                            topBoxes[currentTopBox] = [firstActive,currentLast];
                        }
                    }
                    
                    currentTopBox = topBoxes.length;
                }
            }
            lastActiveInRow = currentLast;
            if(rowBreak)currentTopBox = topBoxes.length;
        }
    }

    console.log(frontBoxes,topBoxes);
    for(var box of frontBoxes.sort((a,b)=>a[0].z-b[0].z)){
        var front = [
            box[0].x, box[0].y -m, box[1].z +m,
            box[1].x +m, box[0].y -m, box[1].z +m,
            box[1].x +m, box[1].y, box[1].z +m,
            box[0].x, box[1].y, box[1].z +m,
        ];

        var height = Math.abs(box[0].y - box[1].y)+1;
        var depth = Math.abs(box[0].x - box[1].x)+1;
        
        indices.push(
            iC,iC+1,iC+2,iC,iC+2,iC+3,
        );
        iC+=4;
            
        Array.prototype.push.apply(positions,front);
        uvs.push(
            0,0,
            depth,0,
            depth,height,
            0,height,
        );
    }
    
    for(var box of topBoxes.sort((a,b)=>a[0].y-b[0].y)){
        var top = [
            box[0].x * m, box[0].y * m, box[0].z * m,
            box[0].x * m, box[0].y * m, box[1].z * m +m,
            box[1].x * m +m, box[0].y * m, box[1].z * m +m,
            box[1].x * m +m, box[0].y * m, box[0].z * m,
        ];
        
        var width = Math.abs(box[0].z - box[1].z)+1;
        var depth = Math.abs(box[0].x - box[1].x)+1;
        var height = Math.abs(box[0].y - box[1].y)+1;
        //console.log(width,depth);
        
        indices.push(
            iC,iC+1,iC+2,iC,iC+2,iC+3,
        );
        iC+=4;
        
        Array.prototype.push.apply(positions,top);
        uvs.push(
            0,depth,
            width,depth,
            width,0,
            0,0,
        );
    }
    
  
    return {
      positions: positions,
      indices: indices,
      uvs: uvs
    };
}