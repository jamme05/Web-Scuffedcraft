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
class PartialChunk{
    constructor(dimensions){
        this.dimensions = dimensions;
    }
    dimensions = {x:16,y:256,z:16};
    x;y;
}