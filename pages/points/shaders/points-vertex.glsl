precision highp float;
uniform mat4 u_camera;

attribute vec3 a_position;

void main(void) {
  gl_Position = u_camera * vec4(a_position, 1.0);

  if (gl_Position.w > 0.0) {
    gl_PointSize = 4.0 / gl_Position.w;
  } else {
    gl_PointSize = 0.0;
  }
}