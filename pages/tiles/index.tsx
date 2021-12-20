/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
// Tiles System
import { RendererClassic, RendererTiling, RendererTiling2 } from '../../modules/tiles';
import { RendererBase } from '../../modules/tiles/renderer-base';
import { WidgetManager } from '../../modules/tiles/widget-manager';
import { buttonGroup, Leva, useControls } from 'leva';
import styles from './tiles_page_style.module.css';

const enum RenderingEngine {
  Classic = 'classic',
  Tiling = 'tiling',
  Tiling2 = 'tiling2'
}

const { assetPrefix } = getConfig().publicRuntimeConfig;

const TilesAPI: NextPage = () => {
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>(RenderingEngine.Tiling2);

  const [{ tileSize, showTiles }, set] = useControls(() => ({
    renderingEngine: {
      label: 'Rendering Engine',
      value: renderingEngine,
      options: {
        'Classic': 'classic',
        'Tiling': 'tiling',
        'Tiling 2': 'tiling2'
      },
      onChange: setRenderingEngine
    },
    ...(
      renderingEngine === 'tiling2' ? {
        tileSize: {
          label: 'Title Size',
          value: 512,
          min: 256,
          max: 1024,
          step: 1
        },
        showTiles: {
          label: 'Show Tiles',
          value: true
        }
      } : {}
    ),
    zoomIn: buttonGroup({
      label: 'Zoom-In Automation',
      opts: {
        'Start': () => {
          rendererRef.current.navigationManager.zoomInAutomation();
        },
        'Stop': () => {
          // TODO: Stop automation
        }
      },
    }),
    zoomOut: buttonGroup({
      label: 'Zoom-Out Automation',
      opts: {
        'Start': () => {
          rendererRef.current.navigationManager.zoomOutAutomation();
        },
        'Stop': () => {
          // TODO: Stop automation
        }
      },
    }),
    pan: buttonGroup({
      label: 'Pan Automation',
      opts: {
        'Start': () => {
          rendererRef.current.navigationManager.panAutomation();
        },
        'Stop': () => {
          // TODO: Stop automation
        }
      },
    }),
  }), [renderingEngine]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widgetManagerRef = useRef<WidgetManager>(null);
  const rendererRef = useRef<RendererBase>(null);

  useEffect(() => {
    widgetManagerRef.current = new WidgetManager({ assetPrefix });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    switch (renderingEngine) {
      case RenderingEngine.Classic:
        rendererRef.current = new RendererClassic({
          canvas: canvasRef.current,
          widgetManager: widgetManagerRef.current
        });
        break;

      case RenderingEngine.Tiling:
        rendererRef.current = new RendererTiling({
          canvas: canvasRef.current,
          widgetManager: widgetManagerRef.current
        });
        break;

      case RenderingEngine.Tiling2:
        rendererRef.current = new RendererTiling2({
          canvas: canvasRef.current,
          widgetManager: widgetManagerRef.current,
          tileSize,
          showTiles
        });
    }

    return () => {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }
  }, [renderingEngine, tileSize, showTiles]);

  return (
    <div>
      <div>
        <h2 className={styles.title}>[PoC] Tiles API</h2>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div id="widgetInfo" className={styles.widgetInfo} />
        <div className={styles.tweaks}>
          <Leva fill />
        </div>
      </div>
    </div>
  );
};

export default TilesAPI;
