import { RendererBase, RendererProps } from './renderer-base';
import {
  BoundaryBox,
  IPoint,
  ISize,
  VisualUpdateParams,
  getIntersection
} from './types';
import { Widget } from './widget';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

type TileKey = string;
type TileIndex = [number, number];
type RectTuple = [number, number, number, number];

function composeTileKey(index: TileIndex): TileKey {
  return `${index[0]},${index[1]}`;
}

const enum TileState {
  IDLE,
  RENDERING,
  RENDERED,
  ERROR,
  EMPTY
}

class Tile {
  index: TileIndex;
  box: BoundaryBox;
  scale: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: TileState = TileState.IDLE;
  needsRender = false;

  constructor(index: TileIndex, box: BoundaryBox, scale: number) {
    this.index = index;
    this.box = box;
    this.scale = scale;
    this.canvas = document.createElement('canvas');
    this.canvas.width = box.width;
    this.canvas.height = box.height;
    this.ctx = this.canvas.getContext('2d');
  }

  get key(): string {
    return composeTileKey(this.index);
  }
}

class TileGrid {
  constructor() {

  }

  static getTileTopLeftPosition(tileIndex: TileIndex, tileSize: ISize): IPoint {
    return { x: tileIndex[0] * tileSize.width, y: tileIndex[1] * tileSize.height };
  }

  static getTileBottomRightPosition(tileIndex: TileIndex, tileSize: ISize): IPoint {
    return {
      x: (tileIndex[0] + 1) * tileSize.width - 1,
      y: (tileIndex[1] + 1) * tileSize.height - 1
    };
  }

  static getTileBounds(tileIndex: TileIndex, tileSize: ISize): BoundaryBox {
    return {
      ...this.getTileTopLeftPosition(tileIndex, tileSize),
      ...tileSize
    };
  }

  static getTileIndexByPosition(point: IPoint, tileSize: ISize): TileIndex {
    return [Math.floor(point.x / tileSize.width), Math.floor(point.y / tileSize.height)];
  }

  static getTileIndexesInViewport(viewport: BoundaryBox, tileSize: ISize): [TileIndex, TileIndex] {
    const topLeftTileIndex = this.getTileIndexByPosition(viewport, tileSize);
    const bottomRightTileIndex = this.getTileIndexByPosition({
      x: viewport.x + viewport.width,
      y: viewport.y + viewport.height
    }, tileSize);

    return [topLeftTileIndex, bottomRightTileIndex];
  }
}


// TODO: LRU Cache
class TileCache {
  private map = new Map<TileKey, Tile>();

  constructor() {

  }

  add(tile: Tile) {
    this.map.set(tile.key, tile);
  }

  get(key: TileKey) {
    return this.map.get(key);
  }

  clear() {
    this.map.clear();
  }
}

class TileRenderingQueue {

}

interface TilingRendererProps {
  tileSize?: number;
  showTiles?: boolean;
}

export class RendererTiling2 extends RendererBase {
  viewport: BoundaryBox;
  scale = 0;

  private tileSize: ISize = { width: 512, height: 512 };
  private tileCache = new TileCache();
  private showTiles = false;

  private zoomRerenderRaf: number;

  constructor(props: RendererProps & TilingRendererProps) {
    super(props);

    this.updateSettings(props, false);

    // const { worldBox } = this.widgetManager;
    // const worldTopLeft: IPoint = { x: worldBox.x, y: worldBox.y };
    // const worldBottomRight: IPoint = {
    //   x: worldBox.x + worldBox.width,
    //   y: worldBox.y + worldBox.height
    // };
    // const worldScale = 1;

    // const tileSize = props.tileSize;
    // const tileWidth = tileSize;
    // const tileHeight = tileSize;
    //
    // const topTilesCount = Math.ceil(Math.abs(worldTopLeft.y) / tileHeight);
    // const rightTilesCount = Math.ceil(worldBottomRight.x / tileWidth);
    // const bottomTilesCount = Math.ceil(worldBottomRight.y / tileHeight);
    // const leftTilesCount = Math.ceil(Math.abs(worldTopLeft.x) / tileWidth);
    // const totalTilesCount = topTilesCount + rightTilesCount + bottomTilesCount + bottomTilesCount;
  }

  updateSettings(props: TilingRendererProps, refresh: boolean = true) {
    console.log('updateSettings');
    this.tileSize = { width: props.tileSize, height: props.tileSize };
    this.showTiles = props.showTiles;
    this.tileCache.clear();

    if (refresh) {
      this.refresh(true);
    }
  }

  _render(params: VisualUpdateParams) {
    const { scale } = params;
    const viewport = this.getVisualUpdateParamsBox(params);
    const isScaleChanged = scale !== this.scale;
    const isZoomedOut = scale < this.scale;

    this.doRender(viewport, scale);

    if (isScaleChanged) {
      if (isZoomedOut) {
        this.zoomInRerenderDebounced.cancel();
        this.zoomOutRerenderDebounced();
      } else {
        this.zoomOutRerenderDebounced.cancel();
        this.zoomInRerenderDebounced();
      }
    }
  }

  reset() {
    // this.scale = 0;
  }


  private doRender(viewport: BoundaryBox, scale: number, refresh: boolean = false) {
    const isScaleChanged = scale !== this.scale;

    this.viewport = viewport;
    this.scale = scale;

    let tiles: Tile[] = [];
    let needsRender = false;

    // if (scale !== this.scale) {
    //   this.tileCache.clear();
    //   needsRender = true;
    // }

    let tileScale = scale;
    let scaledTileWidth = this.tileSize.width * tileScale;
    let scaledTileHeight = this.tileSize.height * tileScale;

    // if (scale < 1) {
    //   tileScale = 1
    //   scaledTileWidth = this.tileSize.width;
    //   scaledTileHeight = this.tileSize.height;
    // }

    let scaledTileSize = { width: scaledTileWidth, height: scaledTileHeight };

    const scaledViewport = {
      x: viewport.x * scale,
      y: viewport.y * scale,
      width: viewport.width * scale,
      height: viewport.height * scale
    };

    const [topLeftIndex, bottomRightIndex] = TileGrid.getTileIndexesInViewport(scaledViewport, scaledTileSize);
    const tilesTopLeftPosition = TileGrid.getTileTopLeftPosition(topLeftIndex, scaledTileSize);
    const tilesBottomRightPosition = TileGrid.getTileBottomRightPosition(bottomRightIndex, scaledTileSize);
    const tileBounds = {
      ...tilesTopLeftPosition,
      width: tilesBottomRightPosition.x - tilesTopLeftPosition.x,
      height: tilesBottomRightPosition.y - tilesTopLeftPosition.y
    };

    for (let row = topLeftIndex[1]; row <= bottomRightIndex[1]; row++) {
      for (let col = topLeftIndex[0]; col <= bottomRightIndex[0]; col++) {
        const tileIndex: TileIndex = [col, row];
        const tileBounds = TileGrid.getTileBounds(tileIndex, scaledTileSize);

        let tile = this.tileCache.get(composeTileKey(tileIndex));

        if (!tile || refresh) {
          if (tile) {
            tile.box = tileBounds;
            tile.scale = tileScale;
            tile.needsRender = true;
          } else {
            tile = new Tile(tileIndex, tileBounds, tileScale);
            tile.needsRender = true;

            this.tileCache.add(tile);
          }
        } else {
          if (!isScaleChanged && tile.scale !== tileScale) {
            tile.box = tileBounds;
            tile.scale = tileScale;
            tile.needsRender = true;
          }
        }

        tiles.push(tile);
        needsRender ||= tile.needsRender;
      }
    }

    let widgets;

    if (needsRender) {
      this.renderedTiles = 0;
      this.renderedWidgets = 0;
      // TODO: Can be optimized by creating tileBounds only for tiles that needsRender
      widgets = this.widgetManager.getWidgets(tileBounds, scale);
    }

    this.renderTiles(tiles, widgets);
    this.renderViewport(tiles, scaledViewport);
  }

  private zoomInRerenderDebounced = debounce(() => {
    console.log('zoomInRerenderDebounced');
    cancelAnimationFrame(this.zoomRerenderRaf);
    this.zoomRerenderRaf = requestAnimationFrame(() => {
      this.doRender(this.viewport, this.scale, true);
    });
  }, 500, { leading: false, trailing: true, maxWait: 3000 });

  private zoomOutRerenderDebounced = debounce(() => {
    console.log('zoomOutRerenderDebounced');
    cancelAnimationFrame(this.zoomRerenderRaf);
    this.zoomRerenderRaf = requestAnimationFrame(() => {
      this.doRender(this.viewport, this.scale, true);
    });
  }, 500, { leading: false, trailing: true });

  private renderTiles(tiles: Tile[], widgets?: Widget[]): void {
    for (let i = 0; i < tiles.length; i++) {
      this.renderTile(tiles[i], widgets);
    }
  }

  private renderTile(tile: Tile, widgets?: Widget[]): void {
    if (!tile.needsRender || !widgets.length) {
      return;
    }

    widgets = this.widgetManager.getWidgets(tile.box, this.scale, widgets);

    this.drawContext2(tile.ctx, tile.box, this.scale, widgets);

    tile.needsRender = false;
  }

  protected drawContext2(
    context: CanvasRenderingContext2D,
    box: BoundaryBox,
    scale: number,
    fromWidgets?: Widget[]
  ): void {
    const widgets = this.widgetManager.getWidgets(box, scale, fromWidgets);

    if (context.canvas.width !== box.width || context.canvas.height !== box.height) {
      context.canvas.width = box.width;
      context.canvas.height = box.height;
    } else {
      context.clearRect(0, 0, box.width, box.height);
    }

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];

      context.drawImage(
        widget.image,
        widget.box.x * scale - box.x,
        widget.box.y * scale - box.y,
        widget.box.width * scale,
        widget.box.height * scale
      );
    }

    this.renderedWidgets += widgets.length;
    this.renderedTiles += 1;
    this.renderCount += 1;
  }

  private renderViewport(tiles: Tile[], scaledViewport: BoundaryBox) {
    this.context.clearRect(0, 0, this.container.width, this.container.height);

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      let scaledBox = tile.box;

      if (tile.scale !== this.scale) {
        scaledBox = {
          x: scaledBox.x / tile.scale * this.scale,
          y: scaledBox.y / tile.scale * this.scale,
          width: scaledBox.width / tile.scale * this.scale,
          height: scaledBox.height / tile.scale * this.scale
        };
      }

      const intersection = getIntersection(scaledBox, scaledViewport);

      if (!intersection) {
        console.log('WTF? No intersection', { tile, scaledBox, scaledViewport });
        continue;
      }

      let intersection2 = intersection;

      if (tile.scale !== this.scale) {
        intersection2 = {
          x: intersection2.x * tile.scale / this.scale,
          y: intersection2.y * tile.scale / this.scale,
          width: intersection2.width * tile.scale / this.scale,
          height: intersection2.height * tile.scale / this.scale
        };
      }

      const src: RectTuple = [
        intersection2.x - tile.box.x,
        intersection2.y - tile.box.y,
        intersection2.width,
        intersection2.height
      ];

      const dst: RectTuple = [
        intersection.x - scaledViewport.x,
        intersection.y - scaledViewport.y,
        Math.min(scaledBox.width, intersection.width),
        Math.min(scaledBox.height, intersection.height)
      ];

      this.context.drawImage(tiles[i].canvas, ...src, ...dst);

      if (this.showTiles) {
        this.context.strokeStyle = '#ff0000';
        this.context.lineWidth = devicePixelRatio - 0.5;

        this.context.strokeRect(...dst);
      }
    }
  }
}
