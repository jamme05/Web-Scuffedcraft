class Texture{
    static textureCount = 0;
    id;
    texture;
    /**
     * @type {WebGL2RenderingContext}
     */
    gl;
    isLoaded = false;

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {WebGLTexture} textureUrl 
     */
    constructor(gl,textureUrl){
        this.gl = gl;
        this.id = (Texture.textureCount++);
        var t = this.texture = gl.createTexture();
        var img = new Image();
        img.src = textureUrl;
        
    }
}