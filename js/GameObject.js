class GameObject {
    /**
     * @type {GameObject}
     */
    parent;
    /**
     * @type {Transform}
     */
    Transform;
    /**
     * @type {WebGL2RenderingContext}
     */
    gl;

    constructor(gl){
        this.gl=gl;
    }

    GetPosition(){
        let m = mat4.create();
        mat4.add(m,this.parent.Transform.mat,this.Transform.mat);
        return m;
    }
}