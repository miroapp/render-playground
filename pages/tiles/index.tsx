/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useRef } from "react";
// Tiles System
import { RendererClassic, RendererTiling } from "../../modules/tiles";
import { RendererBase } from "../../modules/tiles/renderer-base";
import { WidgetManager } from "../../modules/tiles/widget-manager";
import styles from "./tiles_page_style.module.css";

const TilesAPI: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widgetManagerRef = useRef<WidgetManager>(null);
  const rendererRef = useRef<RendererBase>(null);
  useEffect(() => {
    // Constructor
    if (canvasRef.current) {
      widgetManagerRef.current = new WidgetManager();
      rendererRef.current = new RendererTiling({
        canvas: canvasRef.current,
        widgetManager: widgetManagerRef.current,
      });
    }
    // Destructor
    return () => {
      rendererRef.current.destroy();
      rendererRef.current = null;
    };
  }, []);

  function setTiling() {
    rendererRef.current?.destroy();
    rendererRef.current = new RendererTiling({
      canvas: canvasRef.current,
      widgetManager: widgetManagerRef.current,
    });
  }

  function setClassic() {
    rendererRef.current?.destroy();
    rendererRef.current = new RendererClassic({
      canvas: canvasRef.current,
      widgetManager: widgetManagerRef.current,
    });
  }

  function zoomInAutomation() {
    rendererRef.current.navigationManager.zoomInAutomation();
  }

  function zoomOutAutomation() {
    rendererRef.current.navigationManager.zoomOutAutomation();
  }

  function panAutomation() {
    rendererRef.current.navigationManager.panAutomation();
  }

  return (
    <div>
      <div>
        <h2 className={styles.title}>[PoC] Tiles API</h2>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div>
          <button onClick={setTiling}>Tiling</button>
          <button onClick={setClassic}>Classic</button>
          <button onClick={zoomInAutomation}>Zoom in</button>
          <button onClick={zoomOutAutomation}>Zoom out</button>
          <button onClick={panAutomation}>Pan</button>
        </div>
        <div id="widgetInfo" className={styles.widgetInfo}></div>
      </div>
    </div>
  );
};

export default TilesAPI;
