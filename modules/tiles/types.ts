export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface BoundaryBox extends IPoint, ISize {}

export interface VisualUpdateParams {
  /**
   * Middle of the canvas
   */
  canvasOffset: IPoint;
  /**
   * Width and Height of the canvas
   */
  /**
   * Zoom level of the canvas
   */
  scale: number;
}

export type ViewportUpdateCallback = (params: VisualUpdateParams) => void;

export function isWithin(p: IPoint, b: BoundaryBox) {
  const px = p.x;
  const py = p.y;
  const bx0 = b.x;
  const by0 = b.y;
  const bx1 = b.x + b.width;
  const by1 = b.y + b.height;

  return px > bx0 && px < bx1 && py > by0 && py < by1;
}

export function isIntersects(a: BoundaryBox, b: BoundaryBox) {
  const ax0 = a.x;
  const ay0 = a.y;
  const ax1 = a.x + a.width;
  const ay1 = a.y + a.height;
  const bx0 = b.x;
  const by0 = b.y;
  const bx1 = b.x + b.width;
  const by1 = b.y + b.height;

  return bx1 > ax0 && bx0 < ax1 && by1 > ay0 && by0 < ay1;
}

export function isContains(a: BoundaryBox, b: BoundaryBox) {
  const ax0 = a.x;
  const ay0 = a.y;
  const ax1 = a.x + a.width;
  const ay1 = a.y + a.height;
  const bx0 = b.x;
  const by0 = b.y;
  const bx1 = b.x + b.width;
  const by1 = b.y + b.height;

  return bx0 > ax0 && bx1 < ax1 && by0 > ay0 && by1 < ay1;
}

export function getIntersection(a: BoundaryBox, b: BoundaryBox): BoundaryBox | undefined {
  if (!isIntersects(a, b)) {
    return;
  }

  const x0 = Math.max(a.x, b.x);
  const y0 = Math.max(a.y, b.y);
  const x1 = Math.min(a.x + a.width, b.x + b.width);
  const y1 = Math.min(a.y + a.height, b.y + b.height);

  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}
