export interface RendererInterface {
  resetZoom(): void;
  destroy(): void;
}

export interface ZoomSimulationInterface {
  startZoomInAutomation(): void;

  stopZoomInAutomation(): void;

  startZoomOutAutomation(): void;

  stopZoomOutAutomation(): void;
}

export interface PanSimulationInterface {
  startPanAutomation(): void;

  stopPanAutomation(): void;
}