attribute vec3 coordinates;
uniform vec4 translation;

void main(void) {
    gl_Position = vec4(coordinates, 1) + translation;
}