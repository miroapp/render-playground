precision highp float;

varying float v_w;
uniform sampler2D u_sprite;  // texture we are drawing

void main(void) {
  vec4 color = texture2D(u_sprite, gl_PointCoord);
  gl_FragColor = color * vec4(1.0);
}