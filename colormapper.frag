precision highp float;

uniform sampler2D u_sprite;
uniform sampler2D u_pattern;
varying vec2 v_uv;

void main() {
    vec4 sprite_color = texture2D(u_sprite,v_uv);
    gl_FragColor = texture2D(u_pattern,sprite_color.xy) * sprite_color.w;
}