import { RendererBase } from './renderer-base';
import { IPoint } from './types';

export class NavigationManager {
  private _lastCursorPosition: IPoint = { x: 0, y: 0 };
  private _navigationStartCursorPosition: IPoint | undefined = undefined;

  private _isInvalid: boolean = true;
  private _isZooming: boolean = false;
  public position: IPoint;
  public scale: number;

  private _deltaPan: IPoint = { x: 0, y: 0 };
  private _endZoomTimeout: NodeJS.Timeout;

  private _time = 0;
  private _frames = 0;

  private panAutomationRafId: number;
  private zoomInAutomationRafId: number;
  private zoomOutAutomationRafId: number;

  constructor(readonly renderer: RendererBase) {
    const canvas = this.renderer.container;
    this.position = { x: 0, y: 0 };
    this.scale = 1;

    canvas.addEventListener('pointerdown', this._startNavigation, false);
    canvas.addEventListener('wheel', this.onMouseWheel, false);
  }

  refresh() {
    const needsRender = this._isInvalid || this._isZooming;
    if (this._isInvalid) {
      // update position of the camera
      this.position.x = this.position.x + this._deltaPan.x;
      this.position.y = this.position.y + this._deltaPan.y;
      this._deltaPan.x = 0;
      this._deltaPan.y = 0;
      this._isInvalid = false;
    }
    return needsRender;
  }

  zoomBy(delta: number, cursor?: IPoint): this {
    const newScale = Math.min(Math.max(this.scale * (1 + delta * 0.01), 0.04), 4);
    if (newScale !== this.scale) {
      this.scale = Math.min(Math.max(this.scale * (1 + delta * 0.01), 0.04), 4);
      clearTimeout(this._endZoomTimeout);
      this._endZoomTimeout = setTimeout(() => {
        this.renderer.reset();
        this.renderer.render({ canvasOffset: this.position, scale: this.scale });
        this._isZooming = false;
      }, 100);
      this._isZooming = true;
    }
    return this;
  }

  panBy(deltaX: number, deltaY: number): this {
    this._deltaPan.x = deltaX / this.scale;
    this._deltaPan.y = deltaY / this.scale;
    // require refresh
    this._isInvalid = true;
    return this;
  }

  startZoomOutAutomation() {
    cancelAnimationFrame(this.zoomOutAutomationRafId);

    this.position = { x: 0, y: 0 };
    this.scale = 4;
    this._time = performance.now();
    this._frames = 0;

    const automate = () => {
      if (this.scale > 0.04) {
        this.zoomBy(-1);
        this._frames += 1;
        this.zoomOutAutomationRafId = requestAnimationFrame(automate);
      } else {
        console.log((1000 * this._frames) / (performance.now() - this._time), 'fps');
      }
    };

    automate();
  }

  stopZoomOutAutomation() {
    cancelAnimationFrame(this.zoomOutAutomationRafId);
    console.log((1000 * this._frames) / (performance.now() - this._time), 'fps');
  }

  startZoomInAutomation() {
    cancelAnimationFrame(this.zoomInAutomationRafId);

    this.position = { x: 0, y: 0 };
    this.scale = 0.04;
    this._time = performance.now();
    this._frames = 0;

    const automate = () => {
      if (this.scale < 4) {
        this.zoomBy(1);
        this._frames += 1;
        this.zoomInAutomationRafId = requestAnimationFrame(automate);
      } else {
        console.log((1000 * this._frames) / (performance.now() - this._time), 'fps');
      }
    };

    automate();
  }

  stopZoomInAutomation() {
    cancelAnimationFrame(this.zoomInAutomationRafId);
    console.log((1000 * this._frames) / (performance.now() - this._time), 'fps');
  }

  startPanAutomation() {
    cancelAnimationFrame(this.panAutomationRafId);

    let { width } = this.renderer.container;

    this.position = { x: 0, y: 0};
    this._time = performance.now();
    this._frames = 0;

    let dd = 1;
    let dx = 20;
    let dy = 20;

    const automate = () => {
      this.panBy(dx * dd, dy * dd);

      this._frames += 1;
      this.panAutomationRafId = requestAnimationFrame(automate);

      const bound = width / this.scale

      if (this.position.x > bound) {
        dd = -1;
      } else if (this.position.x < -bound) {
        dd = 1;
      }
    };

    automate();
  }

  stopPanAutomation() {
    cancelAnimationFrame(this.panAutomationRafId);
    console.log((1000 * this._frames) / (performance.now() - this._time), 'fps');
  }

  destroy() {
    const canvas = this.renderer.container;
    canvas.removeEventListener('pointermove', this._navigate, false);
    canvas.removeEventListener('pointerup', this._endNavigation, false);
    canvas.removeEventListener('pointerdown', this._startNavigation, false);
    canvas.removeEventListener('wheel', this.onMouseWheel, false);
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

    canvas.addEventListener('pointermove', this._navigate, false);
    canvas.addEventListener('pointerup', this._endNavigation, false);

    canvas.removeEventListener('pointerdown', this._startNavigation, false);
  };

  private _endNavigation = (event: PointerEvent) => {
    const canvas = this.renderer.container;
    canvas.removeEventListener('pointermove', this._navigate, false);
    canvas.removeEventListener('pointerup', this._endNavigation, false);
    canvas.addEventListener('pointerdown', this._startNavigation, false);
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
