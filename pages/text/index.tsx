import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import styles from "./text_page_style.module.css";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const ShapesPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontFamilyInput = useRef<HTMLSelectElement>(null);
  const fontSizeInput = useRef<HTMLInputElement>(null);
  const textInput = useRef<HTMLTextAreaElement>(null);
  let canvas: HTMLCanvasElement;
  let fontFamily = "";
  let fontSize = "";
  let text = "";

  function update() {
    if (
      !canvasRef.current ||
      !fontFamilyInput.current ||
      !fontSizeInput.current ||
      !textInput.current
    ) {
      return;
    }

    canvas = canvasRef.current;
    fontFamily = fontFamilyInput.current.value;
    fontSize = fontSizeInput.current.value;
    text = textInput.current.value;

    const font = `${fontSize}px ${fontFamily}`;
    console.log(font);

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = font;
    ctx.strokeStyle = "#FF0000";

    const div = document.getElementById("test") as HTMLDivElement;
    div.textContent = text;
    const textNode: any = div.childNodes[0];
    const range = document.createRange();

    for (let i = 0; i < textNode.length; i++) {
      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);
      const rect = range.getBoundingClientRect();
      console.log(rect);
      ctx.strokeRect(rect.x, 0, rect.width, rect.height);
    }
  }

  useEffect(() => update(), []);

  return (
    <div>
      <div>
        <h2 className={styles.title}>Get glyph positions of text paragraph</h2>
        <div className={styles.card}>
          <div id="test"></div>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        <div>
          <select ref={fontFamilyInput}>
            <option value="Arial" selected>
              Arial
            </option>
            <option value="Serif">Serif</option>
          </select>
          <input ref={fontSizeInput} type="number" onChange={update}></input>
          <textarea ref={textInput} onChange={update}>
            Hello world!
          </textarea>
        </div>
      </div>
    </div>
  );
};

export default ShapesPage;
