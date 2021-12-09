/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useRef } from "react";
// Tiles System
import { TilesRenderer } from "../../modules/tiles";
import { WidgetManager } from "../../modules/tiles/widget-manager";
import styles from "./tiles_page_style.module.css";

function experiment(renderer: TilesRenderer, animation: boolean) {
  function animate(x: number, y: number, scaleStep: number) {
    if (animation) {
      const scaleSquared = 1 + Math.cos(scaleStep) * 0.8;
      renderer.render({
        canvasOffset: { x, y },
        scale: scaleSquared * scaleSquared,
      });
    } else {
      renderer.refresh();
    }
    window.requestAnimationFrame(() => animate(x + 1, y + 1, scaleStep + 0.005));
  }

  setTimeout(() => animate(0, 0, 0), 1000);
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
    experiment(rendererRef.current, false);
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
