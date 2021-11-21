precision mediump float;

varying vec2 vOuterPosition;
varying vec2 vInnerPosition;
varying vec4 vFillColor;
varying vec4 vStrokeColor;

void main() {
    if (dot(vInnerPosition, vInnerPosition) < 1.0) {
        gl_FragColor = vFillColor;
    } else if (dot(vOuterPosition, vOuterPosition) < 1.0) {
        float alphaSum = 2.0 - vStrokeColor.a;
        vec4 blend = vStrokeColor + vFillColor * (1.0 - vStrokeColor.a);
        gl_FragColor = vec4(blend.rgb / alphaSum, blend.a);
    } else {
        discard;
    }
}
