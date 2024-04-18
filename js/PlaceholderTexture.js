class PlaceholderTexture{
    static color = [255,0,0,255];
    texture;
    /**
     * @type {WebGL2RenderingContext}
     */
    gl;

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl){
        this.gl = gl;
        gl.activeTexture(gl.TEXTURE0);
        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Create a placeholder color (e.g., red color)
        const placeholderColor = new Uint8Array(PlaceholderTexture.color); // RGBA color (red in this case)
        // Set the placeholder texture data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholderColor);
        // Optional: Set texture filtering properties for the placeholder texture
        // You can use gl.NEAREST for pixelated appearance, or gl.LINEAR for smoother interpolation
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
}