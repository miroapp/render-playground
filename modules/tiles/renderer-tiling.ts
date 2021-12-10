import { RendererBase, RendererProps } from "./renderer-base";
import { BoundaryBox, contains, intersects, VisualUpdateParams } from "./types";

const TILE_INDICES = [0, 1, 2, 3];

class Tile {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  needsRender = false;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
  }
}

export class RendererTiling extends RendererBase implements BoundaryBox {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  scale = 0;

  private tileWidth = 0;
  private tileHeight = 0;
  private tiles: Tile[];

  constructor(props: RendererProps) {
    super(props);
    this.tiles = TILE_INDICES.map(() => {
      return new Tile(this.container.width, this.container.height);
    });
  }

  render(params: VisualUpdateParams) {
    const viewport = this.getVisualUpdateParamsBox(params);
    this.widgetManager.getWidgets(viewport);

    // Scale unchanged - panning
    if (params.scale === this.scale) {
      // Viewport completely outside of tiles - redraw everything
      if (!intersects(this, viewport)) {
        this.resetTiles(viewport, params.scale);
      } else {
        // Handle shift on X axis
        if (viewport.x < this.x) {
          this.moveTilesLeft();
        } else if (viewport.x > this.x + this.tileWidth) {
          this.moveTilesRight();
        }
        // Handle shift on Y axis
        if (viewport.y < this.y) {
          this.moveTilesUp();
        } else if (viewport.y > this.y + this.tileHeight) {
          this.moveTilesDown();
        }
      }
      // Scale changed - zooming. Handle redraw if tiles too big or too small
    } else if (!contains(this, viewport) || viewport.width < this.tileWidth / 2) {
      this.resetTiles(viewport, params.scale);
    }

    this.renderTiles();
    this.renderViewport(viewport, params.scale);
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.scale = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
  }

  private renderTile(index: number): void {
    const tile = this.tiles[index];

    if (!tile.needsRender) {
      return;
    }

    const tileBox = {
      x: index % 2 === 0 ? this.x : this.x + this.tileWidth,
      y: index < 2 ? this.y : this.y + this.tileHeight,
      width: this.tileWidth,
      height: this.tileHeight,
    };

    this.drawContext(tile.ctx, tileBox, this.scale);
    tile.needsRender = false;
  }

  private renderTiles(): void {
    TILE_INDICES.forEach((index) => this.renderTile(index));
  }

  private renderViewport(viewport: BoundaryBox, scale: number) {
    const scaleRatio = scale / this.scale;
    const offsetWidth = this.container.width * scaleRatio;
    const offsetHeight = this.container.height * scaleRatio;
    const x0 = (this.x - viewport.x) * scale;
    const x1 = x0 + offsetWidth;
    const y0 = (this.y - viewport.y) * scale;
    const y1 = y0 + offsetHeight;
    this.context.clearRect(0, 0, this.container.width, this.container.height);
    this.context.drawImage(this.tiles[0].canvas, x0, y0, offsetWidth, offsetHeight);
    this.context.drawImage(this.tiles[1].canvas, x1, y0, offsetWidth, offsetHeight);
    this.context.drawImage(this.tiles[2].canvas, x0, y1, offsetWidth, offsetHeight);
    this.context.drawImage(this.tiles[3].canvas, x1, y1, offsetWidth, offsetHeight);
    this.context.strokeStyle = "#FF0000";
    this.context.strokeRect(x0, y0, offsetWidth, offsetHeight);
    this.context.strokeRect(x1, y0, offsetWidth, offsetHeight);
    this.context.strokeRect(x0, y1, offsetWidth, offsetHeight);
    this.context.strokeRect(x1, y1, offsetWidth, offsetHeight);
  }

  private invalidateTiles(...indices: number[]): void {
    indices.forEach((index) => (this.tiles[index].needsRender = true));
  }

  private swapTilesX(): void {
    this.tiles = [this.tiles[1], this.tiles[0], this.tiles[3], this.tiles[2]];
  }

  private swapTilesY(): void {
    this.tiles = [this.tiles[2], this.tiles[3], this.tiles[0], this.tiles[1]];
  }

  private moveTilesLeft(): void {
    this.swapTilesX();
    this.invalidateTiles(0, 2);
    this.x -= this.tileWidth;
  }

  private moveTilesRight(): void {
    this.swapTilesX();
    this.invalidateTiles(1, 3);
    this.x += this.tileWidth;
  }

  private moveTilesUp(): void {
    this.swapTilesY();
    this.invalidateTiles(0, 1);
    this.y -= this.tileHeight;
  }

  private moveTilesDown(): void {
    this.swapTilesY();
    this.invalidateTiles(2, 3);
    this.y += this.tileHeight;
  }

  private resetTiles(viewport: BoundaryBox, scale: number): void {
    this.invalidateTiles(0, 1, 2, 3);
    this.x = viewport.x - viewport.width / 2;
    this.y = viewport.y - viewport.height / 2;
    this.width = viewport.width * 2;
    this.height = viewport.height * 2;
    this.scale = scale;
    this.tileWidth = viewport.width;
    this.tileHeight = viewport.height;
  }
}
