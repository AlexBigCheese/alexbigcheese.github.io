precision highp float;
attribute vec3 a_pos;
attribute vec2 a_uv;
uniform mat4 u_projection;
varying vec2 v_uv;

void main() {
    gl_Position = u_projection*vec4(a_pos,1.);
    v_uv=a_uv;
}