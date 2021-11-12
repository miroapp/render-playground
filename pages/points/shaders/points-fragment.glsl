precision highp float;
uniform sampler2D u_sprite;  // texture we are drawing

void main(void) {
  gl_FragColor = texture2D(u_sprite, gl_PointCoord);;
}