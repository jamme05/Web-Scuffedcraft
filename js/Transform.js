class Transform {
    mat = mat4.create();

    Position;
    Rotation;
    Scale;

    constructor(position,rotation,scale){
        this.Position = new Position(this,position || [0,0,0]);
        this.Rotation = new Rotation(this,rotation || [0,0,0]);
        this.Scale = new Scale(this,scale || [0,0,0]);
    }
}

class Position {
    Parent;
    #reciver = vec3.create();
    #x;
    get X(){ return this.#x; }
    set X(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[v,0,0],[this.#x,0,0]);
        mat4.translate(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#x = v;
    }
    #y;
    get Y(){ return this.#y; }
    set Y(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[0,v,0],[0,this.#y,0]);
        mat4.translate(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#y = v;
    }
    #z;
    get Z(){ return this.#z; }
    set Z(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[0,0,v],[0,0,this.#z]);
        mat4.translate(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#z = v;
    }

    constructor(parent,p){
        this.#x=p[0];
        this.#y=p[1];
        this.#z=p[2];
        mat4.translate(parent.mat,parent.mat,p);
        this.Parent = parent;
    }
}

class Rotation {
    Parent;
    #x;
    get X(){ return this.#x; }
    set X(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        let r = v - this.#x;
        mat4.rotateX(this.Parent.mat,this.Parent.mat,r);
        this.#x = v;
    }
    #y;
    get Y(){ return this.#y; }
    set Y(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        let r = v - this.#y;
        mat4.rotateY(this.Parent.mat,this.Parent.mat,r);
        this.#y = v;
    }
    #z;
    get Z(){ return this.#z; }
    set Z(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        let r = v - this.#z;
        mat4.RotateZ(this.Parent.mat,this.Parent.mat,r);
        this.#z = v;
    }

    constructor(parent,p){
        this.#x=p[0];
        this.#y=p[1];
        this.#z=p[2];
        mat4.rotate(parent.mat,parent.mat,p);
        this.Parent = parent;
    }
}

class Scale {
    Parent;
    #reciver = vec3.create();
    #x = 0;
    get X(){ return this.#x; }
    set X(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[v,0,0],[this.#x,0,0]);
        mat4.scale(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#x = v;
    }
    #y = 0;
    get Y(){ return this.#y; }
    set Y(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[0,v,0],[0,this.#y,0]);
        mat4.scale(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#y = v;
    }
    #z = 0;
    get Z(){ return this.#z; }
    set Z(v){
        if(typeof v != 'number') throw new TypeError('Invalid type. Must be number, got '+(typeof v)+'.');
        vec3.subtract(this.#reciver,[0,0,v],[0,0,this.#z]);
        mat4.scale(this.Parent.mat,this.Parent.mat,this.#reciver);
        this.#z = v;
    }
    set a(v){
        this.X = this.Y = this.Z = v;
    }

    constructor(parent,p){
        this.#x=p[0];
        this.#y=p[1];
        this.#z=p[2];
        mat4.scale(parent.mat,parent.mat,p);
        this.Parent = parent;
    }
}

var a = new Transform([1,2,3]);