precision mediump float;

uniform mat4 u_camera;

attribute vec3 a_position;

varying float v_w;

void main(void) {

  vec4 finalPosition = u_camera * vec4(a_position, 1.0);

  gl_Position = finalPosition;
  v_w = 1.0 / finalPosition.w;

  if (gl_Position.w > 0.0) {
    gl_PointSize = 4.0 / gl_Position.w;
  } else {
    gl_PointSize = 0.0;
  }
}