import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./renderer-base";
import { BoundaryBox, intersects, isWithin } from "./types";
import { Widget } from "./widget";

const AVG_DISTANCE = 200;

interface WidgetManagerOptions {
  assetPrefix?: string
}

export class WidgetManager {
  private worldBox: BoundaryBox = { x: 0, y: 0, width: 0, height: 0 };
  private assets: HTMLImageElement[] = [];
  private widgets: Widget[] = [];

  get numWidgets() {
    return this.widgets.length;
  }

  constructor({ assetPrefix = '' }: WidgetManagerOptions = {}) {
    for (let i = 1; i < 67; i++) {
      const asset = document.createElement("img");
      asset.src = `${assetPrefix}/tiles/${i.toString().padStart(2, "0")}.png`;
      this.assets.push(asset);
    }

    this.createWidgets({
      x: -50 * CANVAS_WIDTH,
      y: -50 * CANVAS_HEIGHT,
      width: 100 * CANVAS_WIDTH,
      height: 100 * CANVAS_HEIGHT,
    });
  }

  getWidgets(box: BoundaryBox, widgets = this.widgets) {
    const result: Widget[] = [];

    widgets.forEach((widget) => {
      const widgetBox = widget.getBoundary();
      if (intersects(box, widgetBox)) {
        result.push(widget);
      }
    });

    return result;
  }

  private createWidgets(box: BoundaryBox) {
    const x0 = Math.min(this.worldBox.x, box.x);
    const y0 = Math.min(this.worldBox.y, box.y);
    const x1 = Math.max(this.worldBox.x + this.worldBox.width, box.x + box.width);
    const y1 = Math.max(this.worldBox.y + this.worldBox.height, box.y + box.height);

    const newWorldBox: BoundaryBox = {
      x: x0,
      y: y0,
      width: x1 - x0,
      height: y1 - y0,
    };

    let x = newWorldBox.x;
    while (x < newWorldBox.x + newWorldBox.width) {
      let y = newWorldBox.y;
      while (y < newWorldBox.y + newWorldBox.height) {
        if (!isWithin({ x, y }, this.worldBox)) {
          const assetIndex = Math.floor(Math.random() * this.assets.length);
          const asset = this.assets[assetIndex];
          this.widgets.push(new Widget(asset, { x, y }));
        }
        y += Math.floor((Math.random() + 0.5) * AVG_DISTANCE);
      }
      x += Math.floor((Math.random() + 0.5) * AVG_DISTANCE);
    }
    this.worldBox = newWorldBox;
  }
}
