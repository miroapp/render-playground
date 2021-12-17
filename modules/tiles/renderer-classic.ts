import { RendererBase } from "./renderer-base";
import { VisualUpdateParams } from "./types";

export class RendererClassic extends RendererBase {
  _render(params: VisualUpdateParams): void {
    const box = this.getVisualUpdateParamsBox(params);
    this.renderedWidgets = 0;
    this.drawContext(this.context, box, params.scale);
  }

  reset() {}
}
