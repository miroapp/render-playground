/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useEffect, useRef } from 'react';
import { SpatialHashRenderer } from '../../modules/hsp';
import styles from './hsp_page_style.module.css';

const HspAPI: NextPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<SpatialHashRenderer>(null);


    useEffect(() => {
        if (!canvasRef.current) return;

        rendererRef.current = new SpatialHashRenderer({
            canvas: canvasRef.current,
        });

        return () => {
            rendererRef.current.destroy();
            rendererRef.current = null;
        }
    }, []);

    return (
        <div className={styles.scene}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
};

export default HspAPI;
