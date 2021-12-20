import { NavigationManager } from './navigation-manager';
import { BoundaryBox, IPoint, ViewportUpdateCallback, VisualUpdateParams } from './types';
import { Widget } from './widget';
import { WidgetManager } from './widget-manager';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

export interface RendererProps {
  canvas: HTMLCanvasElement;
  widgetManager: WidgetManager;
}

export abstract class RendererBase {
  public renderedWidgets = 0;
  public renderedTiles = 0;

  /**
   * container location on HTML page (top-left)
   */
  private _location: IPoint = { x: 0, y: 0 };
  /**
   * last cached cursor position
   */
  private _lastMousePosition?: IPoint;

  protected _container: HTMLCanvasElement;
  protected _context: CanvasRenderingContext2D;
  protected _requestID: number;

  protected widgetManager: WidgetManager;
  navigationManager: NavigationManager;

  constructor({ canvas, widgetManager }: RendererProps) {
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
      throw new Error('Canvas2D renderer is uninitialized!');
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    this._container = canvas;
    this._context = ctx;

    this.widgetManager = widgetManager;
    this.navigationManager = new NavigationManager(this);

    this._container.addEventListener('pointerover', this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener('pointermove', this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener('wheel', this.dispatchMouseOrWheelOverEvent, {
      capture: true
    });
    window.addEventListener('scroll', this.captureLocation.bind(this));

    // initialize location of the canvas
    this.captureLocation();

    // Start rendering loop
    setTimeout(this.refresh, 1000);
  }

  get container(): HTMLCanvasElement {
    return this._container;
  }

  get context(): CanvasRenderingContext2D {
    return this._context;
  }

  background(color: string) {
    const ctx = this._context;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  render(params: VisualUpdateParams): void {
    this._render(params);
    document.getElementById('widgetInfo').innerText = `
      Total widgets: ${this.widgetManager.numWidgets}
      rendered widgets: ${this.renderedWidgets}
      rendered tiles: ${this.renderedTiles}
    `;
  }

  abstract _render(params: VisualUpdateParams): void;

  abstract reset(): void;

  refresh = () => {
    if (!this.navigationManager) return;

    const needsRender = this.navigationManager.refresh();

    if (needsRender) {
      this.render({
        canvasOffset: this.navigationManager.position,
        scale: this.navigationManager.scale
      });
    }
    this._requestID = requestAnimationFrame(this.refresh);
  };

  onViewportUpdate(callback: ViewportUpdateCallback) {
  }

  destroy() {
    cancelAnimationFrame(this._requestID);
    this.navigationManager.destroy();
    this.navigationManager = null;
  }

  clientToEngineSpace(x: number, y: number): IPoint {
    return { x: x - this._location.x, y: y - this._location.y };
  }

  setMousePosition(x: number, y: number): IPoint {
    const position = this.clientToEngineSpace(x, y);
    this._lastMousePosition = position;
    return this._lastMousePosition;
  }

  getMousePosition(): IPoint | undefined {
    return this._lastMousePosition;
  }

  protected drawContext(
    context: CanvasRenderingContext2D,
    box: BoundaryBox,
    scale: number,
    fromWidgets?: Widget[]
  ): void {
    const widgets = this.widgetManager.getWidgets(box, fromWidgets);
    context.clearRect(0, 0, this._container.width, this._container.width);
    widgets.forEach((widget) => {
      context.drawImage(
        widget.image,
        (widget.position.x - box.x) * scale,
        (widget.position.y - box.y) * scale,
        // Images are stored at 4x resolution
        (widget.image.width * scale) / 4,
        (widget.image.height * scale) / 4
      );
    });
    this.renderedWidgets += widgets.length;
    this.renderedTiles += 1;
  }

  protected getVisualUpdateParamsBox(params: VisualUpdateParams) {
    const width = this._container.width / params.scale;
    const height = this._container.height / params.scale;
    const x = params.canvasOffset.x - width / 2;
    const y = params.canvasOffset.y - height / 2;
    return { x, y, width, height };
  }

  private captureLocation(): void {
    const canvas = this._container;
    const { left, top } = canvas.getBoundingClientRect();
    this._location.x = left;
    this._location.y = top;
  }

  private dispatchMouseOrWheelOverEvent = (event: MouseEvent | WheelEvent | PointerEvent) => {
    this.setMousePosition(event.clientX, event.clientY);
  };
}
