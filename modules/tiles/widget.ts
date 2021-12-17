import { BoundaryBox, IPoint } from "./types";

export class Widget {
  constructor(public image: HTMLImageElement, public position: IPoint) {}

  getBoundary(): BoundaryBox {
    return {
      x: this.position.x,
      y: this.position.y,
      // Images are stored at 4x resolution
      width: this.image.width / 4,
      height: this.image.height / 4,
    };
  }
}
