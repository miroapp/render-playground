/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useEffect, useRef, useState } from 'react';
import useCallbackRef from '../../hooks/useCallbackRef';
import getConfig from 'next/config';
// Tiles System
import { RendererClassic, RendererTiling, RendererTiling2 } from '../../modules/tiles';
import { WidgetManager } from '../../modules/tiles/widget-manager';
import { buttonGroup, Leva, useControls } from 'leva';
import styles from './tiles_page_style.module.css';
import {
  PanSimulationInterface,
  RendererInterface,
  ZoomSimulationInterface
} from '../../modules/tiles/renderer-interface';

const enum RenderingEngine {
  Classic = 'classic',
  Tiling = 'tiling',
  Tiling2 = 'tiling2'
}

const { assetPrefix = '' } = getConfig().publicRuntimeConfig || {};

const WORLD_WIDTH = 200_000;
const WORLD_HEIGHT = 200_000;

const TWEAKS_STORAGE_KEY = 'tiling-tweaks';

interface Tweaks {
  renderingEngine: RenderingEngine,
  tileSize?: number,
  showTiles?: boolean
}

const TilesAPI: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widgetManagerRef = useRef<WidgetManager>(null);
  const rendererRef = useRef<RendererInterface & ZoomSimulationInterface & PanSimulationInterface>(null);

  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>(RenderingEngine.Tiling);
  const [pendingTweaksData, setPendingTweaksData] = useState<Tweaks>();

  const [{ tileSize, showTiles }, set] = useControls(() => ({
    renderingEngine: {
      label: 'Rendering Engine',
      value: renderingEngine,
      options: {
        'Classic': 'classic',
        'Tiling': 'tiling',
        'Tiling 2': 'tiling2'
      },
      onChange: (value) => {
        if (renderingEngine !== value) {
          setRenderingEngine(value);
        }
      }
    },
    ...(
      renderingEngine === 'tiling2' ? {
        tileSize: {
          label: 'Title Size',
          value: 2048,
          min: 512,
          max: 4096,
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
          rendererRef.current.startZoomInAutomation();
        },
        'Stop': () => {
          rendererRef.current.stopZoomInAutomation();
        },
        'Reset': () => {
          rendererRef.current.resetZoom();
        }
      }
    }),
    zoomOut: buttonGroup({
      label: 'Zoom-Out Automation',
      opts: {
        'Start': () => {
          rendererRef.current.startZoomOutAutomation();
        },
        'Stop': () => {
          rendererRef.current.stopZoomOutAutomation();
        },
        'Reset': () => {
          rendererRef.current.resetZoom();
        }
      }
    }),
    pan: buttonGroup({
      label: 'Pan Automation',
      opts: {
        'Start': () => {
          rendererRef.current.startPanAutomation();
        },
        'Stop': () => {
          rendererRef.current.stopPanAutomation();
        }
      }
    }),
  }), [renderingEngine]);

  const loadTweaks = useCallbackRef(() => {
    try {
      const data: Tweaks = JSON.parse(localStorage.getItem(TWEAKS_STORAGE_KEY));

      if (data.renderingEngine) {
        setRenderingEngine(data.renderingEngine);
      }

      setPendingTweaksData(data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem(TWEAKS_STORAGE_KEY);
    }
  });

  const loadPendingTweaks = useCallbackRef(() => {
    const data = pendingTweaksData;

    if (!data) return;

    if (renderingEngine === 'tiling2') {
      set({
        renderingEngine: data.renderingEngine,
        tileSize: data.tileSize,
        showTiles: data.showTiles
      });
    } else {
      set({
        renderingEngine: data.renderingEngine
      });
    }
  });

  useEffect(() => {
      loadTweaks();
    }, [loadTweaks]
  );

  useEffect(() => {
    loadPendingTweaks();
  }, [loadPendingTweaks, pendingTweaksData]);

  useEffect(() => {
    widgetManagerRef.current = new WidgetManager({
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT
    }, { assetPrefix });
  }, []);

  const createRenderingEngine = useCallbackRef(() => {
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
  })

  useEffect(() => {
    if (rendererRef.current instanceof RendererTiling2) {
      rendererRef.current.updateSettings({
        tileSize,
        showTiles
      });
    }
  }, [tileSize, showTiles]);

  useEffect(() => {
    if (!canvasRef.current) return;

    createRenderingEngine();

    return () => {
      rendererRef.current.destroy();
      rendererRef.current = null;
    };
  }, [renderingEngine, createRenderingEngine]);

  useEffect(() => {
    localStorage.setItem(TWEAKS_STORAGE_KEY, JSON.stringify({
      renderingEngine,
      tileSize,
      showTiles
    }));
  }, [renderingEngine, tileSize, showTiles]);

  return (
    <div>
      <div>
        <canvas ref={canvasRef} className={styles.canvas} />
        <h2 className={styles.title}>[PoC] Tiles Renderer</h2>
        <div id="widgetInfo" className={styles.widgetInfo} />
        <div className={styles.tweaks}>
          <Leva fill />
        </div>
      </div>
    </div>
  );
};

export default TilesAPI;
