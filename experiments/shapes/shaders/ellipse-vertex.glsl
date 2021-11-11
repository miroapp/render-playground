attribute vec2 position;
attribute vec2 scale;
attribute vec2 translate;
attribute float depth;
attribute float strokeWidth;
attribute vec4 fillColor;
attribute vec4 strokeColor;

varying vec2 vOuterPosition;
varying vec2 vInnerPosition;
varying vec4 vFillColor;
varying vec4 vStrokeColor;

void main() {
    vec2 uv = (position - 0.5) * scale;
    vec2 outerRatio = scale * 0.5;
    vec2 innerRatio = outerRatio - strokeWidth;

    vOuterPosition = uv / outerRatio;
    vInnerPosition = uv / innerRatio;
    vFillColor = fillColor;
    vStrokeColor = strokeColor;

    gl_Position = vec4(position * scale + translate, depth, 1);
}
