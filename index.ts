import * as twgl from "twgl.js";
import { load_wavefront } from "./wavefront_loader.js";
import uv_fragment from "./uv.frag?raw";
import colormapper_fragment from "./colormapper.frag?raw";
import vertex_shader from "./projection.vert?raw";
import dumb_honse_model_data from "./dumb_honse.obj?raw";
import plane_model_data from "./plane.obj?raw";


let MAIN_CANVAS = document.createElement("canvas");
MAIN_CANVAS.width = 720;
MAIN_CANVAS.height = 720;
document.body.appendChild(MAIN_CANVAS);
let gl = MAIN_CANVAS.getContext("webgl2")!;
gl.viewport(0, 0, MAIN_CANVAS.width, MAIN_CANVAS.height);

let honse_model = twgl.createBufferInfoFromArrays(gl, load_wavefront(dumb_honse_model_data));
let square_model = twgl.createBufferInfoFromArrays(gl, load_wavefront(plane_model_data));
let uv_program = twgl.createProgramInfo(gl, [vertex_shader, uv_fragment]);
let colormapper_program = twgl.createProgramInfo(gl, [vertex_shader, colormapper_fragment])
let sprite_buffer = twgl.createFramebufferInfo(gl, undefined, 128, 128);
let perspective_matrix = twgl.m4.perspective((45 / 180) * Math.PI, 1, 0.1, 50.0);

gl.enable(gl.DEPTH_TEST);
//gl.enable(gl.CULL_FACE);
class ValueRotator<T> {
    current_index: number;
    back: string;
    forward: string;
    values: T[];
    get value() { return this.values[this.current_index] }
    constructor(values: T[], back: string, forward: string) {
        this.current_index = 0;
        this.back = back;
        this.forward = forward;
        this.values = values
    }
    run(ev: KeyboardEvent) {
        switch (ev.key) {
            case this.back:
                this.current_index += this.values.length - 1;
                this.current_index %= this.values.length;
                break;
            case this.forward:
                this.current_index += 1;
                this.current_index %= this.values.length;
        }
    }
}

class NumberLiner {
    elem: HTMLDivElement;
    slider: HTMLInputElement;
    constructor(name: HTMLSpanElement,min:number,max:number) {
        this.elem = document.createElement("div");
        this.elem.appendChild(name);
    }
}
const uv_map_reference_texture = twgl.createTexture(gl, { src: "./uvplain.png" });
let uv_map = new ValueRotator([
    sprite_buffer.attachments[0],
    uv_map_reference_texture,
    twgl.createTexture(gl, { src: "./strangeuv.png" })
  ], "q", "w");
let pattern = new ValueRotator([twgl.createTexture(gl, { src: "./obama.png" }),uv_map_reference_texture], "a", "s");
let angle = new ValueRotator({length:100,[n:number]})
document.onkeydown = (ev: KeyboardEvent) => {
    uv_map.run(ev);
    pattern.run(ev);
}
function compose_mat(...transformations: twgl.m4.Mat4[]) {
    let mat = twgl.m4.identity();
    for (const transformation of transformations) {
        twgl.m4.multiply(mat, transformation, mat);
    }
    return mat;
}
function the_animation_frame(time: number) {
    gl.useProgram(uv_program.program);
    twgl.bindFramebufferInfo(gl, sprite_buffer);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const view_mat = twgl.m4.inverse(twgl.m4.lookAt(twgl.v3.create(3, 0, 0), twgl.v3.create(), twgl.v3.create(0, 1, 0)));
    twgl.setBuffersAndAttributes(gl, uv_program, honse_model);
    twgl.setUniforms(uv_program, { u_projection: compose_mat(perspective_matrix, view_mat, twgl.m4.translation(twgl.v3.create(0, -0.5, 0)), twgl.m4.rotationY(time * 0.001),) });
    twgl.drawBufferInfo(gl, honse_model)
    gl.useProgram(colormapper_program.program);
    twgl.bindFramebufferInfo(gl, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    twgl.setBuffersAndAttributes(gl, colormapper_program, square_model);
    twgl.setUniforms(colormapper_program, {
        u_sprite: uv_map.value,
        u_pattern: pattern.value,
        u_projection: compose_mat(
            perspective_matrix,
            view_mat,
            twgl.m4.rotationY(time * 0.0001),
        )
    });
    twgl.drawBufferInfo(gl, square_model);
    requestAnimationFrame(the_animation_frame)
}
the_animation_frame(0)
