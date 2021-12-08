import { BoundaryBox, IPoint } from "./types";

export class Widget {
  constructor(public image: HTMLImageElement, public position: IPoint) {}

  getBoundary(): BoundaryBox {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.image.width,
      height: this.image.height,
    };
  }
}
