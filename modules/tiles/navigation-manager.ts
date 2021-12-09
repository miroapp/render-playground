import type { RendererBase } from "./renderer-base";
import { IPoint } from "./types";

export class NavigationManager {
  private _lastCursorPosition: IPoint = { x: 0, y: 0 };
  private _navigationStartCursorPosition: IPoint | undefined = undefined;

  private _isInvalid: boolean = true;
  public position: IPoint;
  public scale: number;

  private _deltaPan: IPoint = { x: 0, y: 0 };
  private _prevScale: number;

  constructor(readonly renderer: RendererBase) {
    const canvas = this.renderer.container;
    this.position = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
    this.scale = 1;
    this._prevScale = 1;

    canvas.addEventListener("pointerdown", this._startNavigation, false);
    canvas.addEventListener("wheel", this.onMouseWheel, false);
  }

  refresh() {
    const needsRender = this._isInvalid;
    if (this._isInvalid) {
      // update position of the camera
      this.position.x = this.position.x + this._deltaPan.x;
      this.position.y = this.position.y + this._deltaPan.y;
      this._deltaPan.x = 0;
      this._deltaPan.y = 0;
      if (this._prevScale === this.scale) {
        this._isInvalid = false;
      } else {
        this._prevScale = this.scale;
      }
    }
    return needsRender;
  }

  zoomBy(delta: number, cursor?: IPoint): this {
    this.scale = Math.min(Math.max(this.scale + delta * 0.01, 0.05), 4);
    this._isInvalid = true;
    return this;
  }

  panBy(deltaX: number, deltaY: number): this {
    this._deltaPan.x = deltaX;
    this._deltaPan.y = deltaY;
    // require refresh
    this._isInvalid = true;
    return this;
  }

  private onMouseWheel = (event: WheelEvent) => {
    event.preventDefault();
    const position = this.renderer.getMousePosition();
    this._navigationStartCursorPosition = { ...position };
    // const deltaYFactor = isMac ? -1 : -3;
    const deltaYFactor = -1;
    const delta =
      event.deltaMode === 1 ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
    this.zoomBy(delta, this._navigationStartCursorPosition);
  };

  private _startNavigation = (event: PointerEvent) => {
    const canvas = this.renderer.container;
    const position = this.renderer.getMousePosition();
    this._lastCursorPosition.x = position.x;
    this._lastCursorPosition.y = position.y;
    // this._navigationStartCursorPosition.x = position.x;
    // this._navigationStartCursorPosition.y = position.y;

    canvas.addEventListener("pointermove", this._navigate, false);
    canvas.addEventListener("pointerup", this._endNavigation, false);

    canvas.removeEventListener("pointerdown", this._startNavigation, false);
  };

  private _endNavigation = (event: PointerEvent) => {
    const canvas = this.renderer.container;
    canvas.removeEventListener("pointermove", this._navigate, false);
    canvas.removeEventListener("pointerup", this._endNavigation, false);
    canvas.addEventListener("pointerdown", this._startNavigation, false);
  };

  private _navigate = (event: PointerEvent) => {
    const lastCursorPosition = this._lastCursorPosition;
    const lastDragPosition = this.renderer.getMousePosition();
    const deltaX = lastCursorPosition.x - lastDragPosition.x;
    const deltaY = lastCursorPosition.y - lastDragPosition.y;
    this._lastCursorPosition.x = lastDragPosition.x;
    this._lastCursorPosition.y = lastDragPosition.y;
    this.panBy(deltaX, deltaY);
  };
}
