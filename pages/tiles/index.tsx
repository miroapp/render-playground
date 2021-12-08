/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useRef } from "react";
// Tiles System
import { TilesRenderer } from "../../modules/tiles";
import { WidgetManager } from "../../modules/tiles/widget-manager";
import styles from "./tiles_page_style.module.css";

function experiment(renderer: TilesRenderer) {
  setTimeout(() => {
    renderer.render({
      canvasOffset: { x: 400, y: -100 },
      size: { width: 0, height: 0 },
      scale: 0.75,
    });
  }, 1000);
}

const TilesAPI: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widgetManagerRef = useRef<WidgetManager>(null);
  const rendererRef = useRef<TilesRenderer>(null);
  useEffect(() => {
    // Constructor
    if (canvasRef.current) {
      widgetManagerRef.current = new WidgetManager();
      rendererRef.current = new TilesRenderer({
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

  useEffect(() => {
    experiment(rendererRef.current);
  }, []);

  return (
    <div>
      <div>
        <h2 className={styles.title}>[PoC] Tiles API</h2>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
};

export default TilesAPI;
