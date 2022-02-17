import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
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
          <Link href="/hsp" passHref>
            <a className={styles.card}>
              <h2>Spatial Hash API &rarr;</h2>
              <p>Experiment with Spatial Hash API.</p>
            </a>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/tiles" passHref>
            <a className={styles.card}>
              <h2>Tiles API &rarr;</h2>
              <p>Experiment with Tiles API.</p>
            </a>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/blending-modes" passHref>
            <a className={styles.card}>
              <h2>Blending Modes &rarr;</h2>
              <p>Experiment with blending modes.</p>
            </a>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/shapes" passHref>
            <a className={styles.card}>
              <h2>Shapes &rarr;</h2>
              <p>Experiment with shapes.</p>
            </a>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/points" passHref>
            <a className={styles.card}>
              <h2>Points &rarr;</h2>
              <p>Experiment with points.</p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
