var _movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
},
Position = {x:0,y:0,z:0},
Rotation = {x:0,y:0,z:0},
Speed = 0.12,
BoostSpeed = 1,
CursorSpeed = 0.001,
Paused = false;

class PlayerController{
    viewMatrix;
    static collissions = false;
    static height = 1.8;
    
    get Enabled(){ return this.#enabled; }
    set Enabled(v){
        this.#enabled = v;
        if(v)this.Enable();
        else this.Disable();
    }
    #enabled = false;

    get Paused(){return Paused};

    /**
     * 
     * @param {mat4} viewMatrix 
     * @param {{Position:{x:number,y:number,z:number},Rotation:{x:number,y:number,z:number},Speed:number,BoostSpeed:number,CursorSpeed:number,EventHandler:{Enable:()=>void,Disable:()=>void}}} set 
     */
    constructor(viewMatrix,set={}){
        this.viewMatrix = viewMatrix;
        Position = set.Position || Position;
        Rotation = set.Rotation || Rotation;
        Speed = set.Speed || Speed;
        BoostSpeed = set.BoostSpeed || BoostSpeed;
        CursorSpeed = set.CursorSpeed || CursorSpeed;
    }


    updateCamera(deltaTime) {
        var speed = deltaTime * _movement.boost ? BoostSpeed : Speed;
        if (_movement.forward) {
            Position.x += Math.sin(Rotation.y) * speed; // Move forward in X direction
            Position.z -= Math.cos(Rotation.y) * speed; // Move forward in Z direction
        }
        if (_movement.left) {
            Position.x -= Math.cos(Rotation.y) * speed; // Move left in X direction
            Position.z -= Math.sin(Rotation.y) * speed; // Move left in Z direction
        }
        if (_movement.backward) {
            Position.x -= Math.sin(Rotation.y) * speed; // Move backward in X direction
            Position.z += Math.cos(Rotation.y) * speed; // Move backward in Z direction
        }
        if (_movement.right) {
            Position.x += Math.cos(Rotation.y) * speed; // Move right in X direction
            Position.z += Math.sin(Rotation.y) * speed; // Move right in Z direction
        }
        if(PlayerController.collissions){

        }else{
            if(_movement.up){
                Position.y += speed;
            }
            if(_movement.down){
                Position.y -= speed;
            }
        }
        mat4.identity(this.viewMatrix); // Reset the view matrix
        mat4.rotateX(this.viewMatrix, this.viewMatrix, Rotation.x);
        mat4.rotateY(this.viewMatrix, this.viewMatrix, Rotation.y);
        mat4.translate(this.viewMatrix, this.viewMatrix, [-Position.x, -Position.y, -Position.z]);
    }

    mouseMove(e){
        Rotation.x += e.movementY * CursorSpeed;
        Rotation.y += e.movementX * CursorSpeed;
    }
    /**
     * 
     * @param {KeyboardEvent} e 
     */
    keyDown(e) {
        if(['w','a','s','d',' ','shift'].includes(e.key.toLowerCase())) e.preventDefault();
        switch (e.key.toLowerCase()) {
        case 'w':
            _movement.forward = true;
            break;
        case 'a':
            _movement.left = true;
            break;
        case 's':
            _movement.backward = true;
            break;
        case 'd':
            _movement.right = true;
            break;
        case ' ':
            _movement.up = true;
            break;
        case 'shift':
            e.preventDefault();
            _movement.down = true;
            break;
        case 'b':
            _movement.boost = !_movement.boost;
            break;
        case 'p':
            Paused = !Paused;
            break;
        case 'c':
            PlayerController.collissions = !PlayerController.collissions;
            break;
        case 'arrowup':
            ++chunkManager.radius;
            break;
        case 'arrowdown':
            if(--chunkManager.radius < 1) chunkManager.radius = 1;
            break;
        case 'r':
            if(++chunkManager.renderMethod > 4) chunkManager.renderMethod = 0;
            break;
        case 'v':
            if(++Chunk.wireframe > 2) Chunk.wireframe = 0;
        default:
            break;
        }
    }
    /**
     * 
     * @param {KeyboardEvent} e 
     */
    keyUp(e) {
        if(['w','a','s','d',' ','shift','b'].includes(e.key.toLowerCase())) e.preventDefault();
        switch (e.key.toLowerCase()) {
        case 'w':
            _movement.forward = false;
            break;
        case 'a':
            _movement.left = false;
            break;
        case 's':
            _movement.backward = false;
            break;
        case 'd':
            _movement.right = false;
            break;
        case ' ':
            _movement.up = false;
            break;
        case 'shift':
            _movement.down = false;
            break;
        default:
            break;
        }
    }
    Enable(){
        document.addEventListener('mousemove',this.mouseMove, false);
        document.addEventListener('keydown',this.keyDown, false);
        document.addEventListener('keyup', this.keyUp, false);
    }
    Disable(){
        document.removeEventListener('mousemove',this.mouseMove, false);
        document.removeEventListener('keydown',this.keyDown, false);
        document.removeEventListener('keyup', this.keyUp, false);
        _movement.forward = _movement.backward = _movement.left = _movement.right = _movement.up = _movement.down = _movement.boost = false;
    }

    GetRotation(){
        return Rotation;
    }

    GetPosition(){
        return [-Position.x, -Position.y, -Position.z];
    }
}