import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/HomePage.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Playground</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Playground</h1>

        <p className={styles.description}>
          Playground for Computer Graphics experiments and benchmarking using GPU acceleration APIs
          (WebGL / WebGPU / etc.)
        </p>

        <div className={styles.grid}>
          <a href="/blending-modes" className={styles.card}>
            <h2>Blending Modes &rarr;</h2>
            <p>Experiment with blending modes.</p>
          </a>
        </div>

        <div className={styles.grid}>
          <a href="/shapes" className={styles.card}>
            <h2>Shapes &rarr;</h2>
            <p>Experiment with shapes.</p>
          </a>
        </div>

        <div className={styles.grid}>
          <a href="/webworkers" className={styles.card}>
            <h2>Web Workers &rarr;</h2>
            <p>Experiment with Web Workers.</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
