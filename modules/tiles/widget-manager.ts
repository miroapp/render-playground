import { BoundaryBox, isIntersects, ISize, isWithin } from './types';
import { Widget } from './widget';

const AVG_DISTANCE = 200;

interface WidgetManagerOptions {
  assetPrefix?: string;
}

export class WidgetManager {
  private _worldBox: BoundaryBox = { x: 0, y: 0, width: 0, height: 0 };
  private assets: HTMLImageElement[] = [];
  private widgets: Widget[] = [];

  get numWidgets() {
    return this.widgets.length;
  }

  get worldBox() {
    return this._worldBox;
  }

  constructor(worldSize: ISize, { assetPrefix = '' }: WidgetManagerOptions = {}) {
    for (let i = 1; i < 67; i++) {
      const asset = document.createElement('img');
      asset.src = `${assetPrefix}/tiles/${i.toString().padStart(2, '0')}.png`;
      this.assets.push(asset);
    }

    this.createWidgets({
      x: -worldSize.width / 2,
      y: -worldSize.height / 2,
      width: worldSize.width,
      height: worldSize.height
    });
  }

  getWidgets(box: BoundaryBox, scale: number = 1, widgets = this.widgets) {
    const result: Widget[] = [];

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];

      if (isIntersects(box, widget.getScaledBoundary(scale))) {
        result.push(widget);
      }
    }

    return result;
  }

  private createWidgets(box: BoundaryBox) {
    const x0 = Math.min(this._worldBox.x, box.x);
    const y0 = Math.min(this._worldBox.y, box.y);
    const x1 = Math.max(this._worldBox.x + this._worldBox.width, box.x + box.width);
    const y1 = Math.max(this._worldBox.y + this._worldBox.height, box.y + box.height);

    const newWorldBox: BoundaryBox = {
      x: x0,
      y: y0,
      width: x1 - x0,
      height: y1 - y0
    };

    let x = newWorldBox.x;
    while (x < newWorldBox.x + newWorldBox.width) {
      let y = newWorldBox.y;
      while (y < newWorldBox.y + newWorldBox.height) {
        if (!isWithin({ x, y }, this._worldBox)) {
          const assetIndex = Math.floor(Math.random() * this.assets.length);
          const asset = this.assets[assetIndex];
          this.widgets.push(new Widget(asset, { x, y }));
        }
        y += Math.floor((Math.random() + 0.5) * AVG_DISTANCE);
      }
      x += Math.floor((Math.random() + 0.5) * AVG_DISTANCE);
    }
    this._worldBox = newWorldBox;
  }
}
