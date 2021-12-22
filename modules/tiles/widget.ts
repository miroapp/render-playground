import { BoundaryBox, IPoint, ISize } from './types';

const imageSizeCache = new WeakMap<HTMLImageElement, ISize>();

export class Widget {
  box: BoundaryBox = { x: 0, y: 0, width: 0, height: 0 };

  constructor(public image: HTMLImageElement, public position: IPoint) {
    this.box = {
      x: this.position.x,
      y: this.position.y,
      ...this.getImageSize()
    };
  }

  getImageSize(): ISize {
    let size = imageSizeCache.get(this.image);

    if (!size) {
      // Images are stored at 4x resolution
      size = {
        width: this.image.width / 4,
        height: this.image.height / 4
      };

      imageSizeCache.set(this.image, size);
    }

    return size;
  }

  getBoundary(): BoundaryBox {
    return this.box;
  }

  getScaledBoundary(scale: number): BoundaryBox {
    return {
      x: this.box.x * scale,
      y: this.box.y * scale,
      width: this.box.width * scale,
      height: this.box.height * scale
    };
  }
}
