import { RendererBase } from "./renderer-base";
import { VisualUpdateParams } from "./types";

export class RendererClassic extends RendererBase {
  render(params: VisualUpdateParams) {
    const box = this.getVisualUpdateParamsBox(params);
    this.drawContext(this.context, box, params.scale);
  }

  reset() {}
}
