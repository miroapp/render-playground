precision mediump float;
uniform vec4 u_fragColor;

void main(void) {
    gl_FragColor = u_fragColor;

    // The line below is essentially what enables the alpha blending.
    gl_FragColor.rgb *= u_fragColor.a;
}