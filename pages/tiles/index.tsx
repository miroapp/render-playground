/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import styles from "./tiles_page_style.module.css";

// Tiles System
import {TilesRenderer} from './core'


function experiment( renderer: TilesRenderer) {
  renderer.background('blue')
}

const TilesAPI: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<TilesRenderer>(null);
  useEffect(() => {
    // Constructor
    if (canvasRef.current) {
      rendererRef.current = new TilesRenderer({ canvas: canvasRef.current })
    }
    // Destructor
    return () => {
      rendererRef.current.destroy()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    experiment(rendererRef.current)
  }, [])

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
