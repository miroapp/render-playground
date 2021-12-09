import { RendererBase, RendererProps } from "./renderer-base";
import { BoundaryBox, contains, VisualUpdateParams } from "./types";

export class RendererTiling extends RendererBase {
  private tileContainers: HTMLCanvasElement[] = [];
  private tileContexts: CanvasRenderingContext2D[] = [];
  private tilesBox: BoundaryBox = { x: 0, y: 0, width: 0, height: 0 };
  private tilesScale = 0;

  constructor(props: RendererProps) {
    super(props);

    [0, 1, 2, 3].forEach(() => {
      const container = document.createElement("canvas");
      container.width = this.container.width;
      container.height = this.container.height;
      const context = container.getContext("2d");
      this.tileContainers.push(container);
      this.tileContexts.push(context);
    });
  }

  render(params: VisualUpdateParams) {
    const viewportBox = this.getVisualUpdateParamsBox(params);
    this.widgetManager.getWidgets(viewportBox);

    const width = viewportBox.width;
    const height = viewportBox.height;

    let left: number;
    let right: number;
    let top: number;
    let bottom: number;
    let topLeftBox: BoundaryBox;
    let topRightBox: BoundaryBox;
    let bottomLeftBox: BoundaryBox;
    let bottomRightBox: BoundaryBox;

    if (params.scale !== this.tilesScale) {
      if (!contains(this.tilesBox, viewportBox) || viewportBox.width < this.tilesBox.width / 4) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        left = viewportBox.x - halfWidth;
        right = viewportBox.x + halfWidth;
        top = viewportBox.y - halfHeight;
        bottom = viewportBox.y + halfHeight;

        topLeftBox = { width, height, x: left, y: top };
        topRightBox = { width, height, x: right, y: top };
        bottomLeftBox = { width, height, x: left, y: bottom };
        bottomRightBox = { width, height, x: right, y: bottom };

        this.drawContext(this.tileContexts[0], topLeftBox, params.scale);
        this.drawContext(this.tileContexts[1], topRightBox, params.scale);
        this.drawContext(this.tileContexts[2], bottomLeftBox, params.scale);
        this.drawContext(this.tileContexts[3], bottomRightBox, params.scale);

        this.tilesBox = { x: left, y: top, width: 2 * width, height: 2 * height };
        this.tilesScale = params.scale;
        console.log(params, viewportBox, this.tilesBox, this.tilesScale);
      }
    } else {
      if (viewportBox.x < this.tilesBox.x) {
        left = this.tilesBox.x - width;
        top = this.tilesBox.y;
        bottom = top + height;
        topLeftBox = { width, height, x: left, y: top };
        bottomLeftBox = { width, height, x: left, y: bottom };
        this.swapTilesX();
        this.drawContext(this.tileContexts[0], topLeftBox, params.scale);
        this.drawContext(this.tileContexts[2], bottomLeftBox, params.scale);
        this.tilesBox.x -= width;
      } else if (viewportBox.x > this.tilesBox.x + viewportBox.width) {
        right = this.tilesBox.x + 2 * width;
        top = this.tilesBox.y;
        bottom = top + height;
        topRightBox = { width, height, x: right, y: top };
        bottomRightBox = { width, height, x: right, y: bottom };
        console.log(topRightBox, bottomRightBox);
        this.swapTilesX();
        this.drawContext(this.tileContexts[1], topRightBox, params.scale);
        this.drawContext(this.tileContexts[3], bottomRightBox, params.scale);
        this.tilesBox.x += width;
      }

      if (viewportBox.y < this.tilesBox.y) {
        top = this.tilesBox.y - height;
        left = this.tilesBox.x;
        right = left + width;
        topLeftBox = { width, height, x: left, y: top };
        topRightBox = { width, height, x: right, y: top };
        this.swapTilesY();
        this.drawContext(this.tileContexts[0], topLeftBox, params.scale);
        this.drawContext(this.tileContexts[1], topRightBox, params.scale);
        this.tilesBox.y -= height;
      } else if (viewportBox.y > this.tilesBox.y + height) {
        bottom = this.tilesBox.y + 2 * height;
        left = this.tilesBox.x;
        right = left + width;
        bottomLeftBox = { width, height, x: left, y: bottom };
        bottomRightBox = { width, height, x: right, y: bottom };
        console.log(bottomLeftBox, bottomRightBox);
        this.swapTilesY();
        this.drawContext(this.tileContexts[2], bottomLeftBox, params.scale);
        this.drawContext(this.tileContexts[3], bottomRightBox, params.scale);
        this.tilesBox.y += height;
      }
    }

    const scaleRatio = params.scale / this.tilesScale;
    const offsetWidth = this.container.width * scaleRatio;
    const offsetHeight = this.container.height * scaleRatio;
    const x0 = (this.tilesBox.x - viewportBox.x) * params.scale;
    const x1 = x0 + offsetWidth;
    const y0 = (this.tilesBox.y - viewportBox.y) * params.scale;
    const y1 = y0 + offsetHeight;
    this.context.clearRect(0, 0, this.container.width, this.container.height);
    this.context.drawImage(this.tileContainers[0], x0, y0, offsetWidth, offsetHeight);
    this.context.drawImage(this.tileContainers[1], x1, y0, offsetWidth, offsetHeight);
    this.context.drawImage(this.tileContainers[2], x0, y1, offsetWidth, offsetHeight);
    this.context.drawImage(this.tileContainers[3], x1, y1, offsetWidth, offsetHeight);
    this.context.strokeStyle = "#FF0000";
    this.context.strokeRect(x0, y0, offsetWidth, offsetHeight);
    this.context.strokeRect(x1, y0, offsetWidth, offsetHeight);
    this.context.strokeRect(x0, y1, offsetWidth, offsetHeight);
    this.context.strokeRect(x1, y1, offsetWidth, offsetHeight);
  }

  reset() {
    this.tilesBox = { x: 0, y: 0, width: 0, height: 0 };
    this.tilesScale = 0;
  }

  private swapTilesX(): void {
    const containers = this.tileContainers;
    const contexts = this.tileContexts;

    this.tileContainers = [containers[1], containers[0], containers[3], containers[2]];
    this.tileContexts = [contexts[1], contexts[0], contexts[3], contexts[2]];
  }

  private swapTilesY(): void {
    const containers = this.tileContainers;
    const contexts = this.tileContexts;

    this.tileContainers = [containers[2], containers[3], containers[0], containers[1]];
    this.tileContexts = [contexts[2], contexts[3], contexts[0], contexts[1]];
  }
}
