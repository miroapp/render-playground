import { NavigationManager } from './navigation-manager';
import { BoundaryBox, IPoint, ViewportUpdateCallback, VisualUpdateParams } from './types';
import { Widget } from './widget';
import { WidgetManager } from './widget-manager';
import {
  PanSimulationInterface,
  RendererInterface,
  ZoomSimulationInterface
} from './renderer-interface';

export interface RendererProps {
  canvas: HTMLCanvasElement;
  widgetManager: WidgetManager;
}

export abstract class RendererBase implements RendererInterface, ZoomSimulationInterface, PanSimulationInterface {
  public renderedTiles = 0;
  public renderedWidgets = 0;
  public renderCount = 0;

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
  protected _rafId: number;

  protected widgetManager: WidgetManager;
  navigationManager: NavigationManager;

  constructor({ canvas, widgetManager }: RendererProps) {
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
      throw new Error('Canvas2D renderer is uninitialized!');
    }

    const { width, height } = canvas.getBoundingClientRect();

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

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
    setTimeout(() => this.refresh(), 1000);

    window.addEventListener('resize', this.handleResize);
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

  handleResize = () => {
    const { width, height } = this._container.getBoundingClientRect();

    const prevWidth = this._container.width / devicePixelRatio;
    const prevHeight = this._container.height / devicePixelRatio;

    this._container.width = width * devicePixelRatio;
    this._container.height = height * devicePixelRatio;

    this.navigationManager.panBy(width - prevWidth, height - prevHeight);

    this.refresh();
  }

  render(params: VisualUpdateParams): void {
    this._render(params);

    document.getElementById('widgetInfo').innerText =
      `Total widgets: ${this.widgetManager.numWidgets}
      Rendered tiles: ${this.renderedTiles}
      Rendered widgets: ${this.renderedWidgets}
      Render count: ${this.renderCount}`;
  }

  abstract _render(params: VisualUpdateParams): void;

  abstract reset(): void;

  refresh = (force: boolean = false) => {
    if (!this.navigationManager) return;

    const needsRender = this.navigationManager.refresh();

    if (force || needsRender) {
      this.render({
        canvasOffset: this.navigationManager.position,
        scale: this.navigationManager.scale
      });
    }

    cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => this.refresh());
  };

  onViewportUpdate(callback: ViewportUpdateCallback) {
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);

    cancelAnimationFrame(this._rafId);
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
    const widgets = this.widgetManager.getWidgets(box, 1, fromWidgets);
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
    this.renderCount += 1;
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

  resetZoom() {
    console.log('resetZoom')
    this.navigationManager.scale = 1;
    this.refresh(true);
  }

  startZoomInAutomation() {
    this.navigationManager.startZoomInAutomation();
  }

  stopZoomInAutomation() {
    this.navigationManager.stopZoomInAutomation();
  }

  startZoomOutAutomation() {
    this.navigationManager.startZoomOutAutomation();
  }

  stopZoomOutAutomation() {
    this.navigationManager.stopZoomOutAutomation();
  }

  startPanAutomation() {
    this.navigationManager.startPanAutomation();
  }

  stopPanAutomation() {
    this.navigationManager.stopPanAutomation();
  }
}