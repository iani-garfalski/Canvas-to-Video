# Canvas-to-Video Engine

A high-performance, client-side rendering pipeline that generates 1080p **MOV** files from DOM text using [Mediabunny](https://github.com/Vanilagy/mediabunny).

---

## Why Mediabunny?
Standard `MediaRecorder` is limited to **real-time** recording (a 30s video takes 30s to export). By using Mediabunny's **WebCodecs** implementation, we achieve **non-real-time encoding**, allowing us to render 1080p video at hardware speeds—often 10x to 20x faster than playback.

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Bundle**:
    This project uses a build script to compile TypeScript into a single, browser-ready file.
    ```bash
    npm run build
    ```
    This generates `dist/bundle.js`.

3.  **Execute in Browser**:
    * Open the target website in Chrome/Edge, Firefox and for webkit Safari or linux alternatives Orion beta or Gnome Web.
    * Open **DevTools** (`F12` or `Cmd+Option+I`).
    * Copy the entire contents of `dist/bundle.js`.
    * Paste it into the **Console** and press **Enter**.
    * The script will initialize the offscreen canvas and begin the recording process automatically.

4.  **This script is in early stages of development and was tested on**:
    * https://visitestonia.com/en

## Architecture & Documentation References
Our implementation follows the **Source → Format → Target** pattern:

* **`CanvasSource`**: Captures the 1080p offscreen canvas and handles `VideoFrame` creation.
* **`MovOutputFormat`**: Wraps raw H.264 chunks into a **QuickTime (.mov)** container for maximum compatibility on Windows and macOS.
* **`BufferTarget`**: Accumulates video bytes into a `Uint8Array` in RAM for instant download.
* **`Output`**: Synchronizes tracks and triggers the final metadata write.

## Engineering Highlights
* **Software-First Encoding**: Uses `prefer-software` to prevent GPU driver resets during high-resolution renders.
* **Resolution-Independent Math**: Internal rendering at `1920x1080` ensures identical text-wrapping between preview and export.
* **Main-Thread Responsiveness**: Implements a micro-yield (`setTimeout`) every 30 frames to prevent the browser from freezing.
* **Thread Safety**: Uses `.slice()` to ensure `Blob` compatibility for buffers generated in Workers.

---

### Implementation Summary

| Component | Role | Documentation Link |
| :--- | :--- | :--- |
| **Orchestrator** | `Output` | [API: Output](https://mediabunny.dev/api/Output) |
| **Encoder** | `CanvasSource` | [Guide: Media Sources](https://mediabunny.dev/guide/media-sources#canvassource) |
| **Muxer** | `MovOutputFormat` | [Guide: Output Formats](https://mediabunny.dev/guide/output-formats) |
| **Storage** | `BufferTarget` | [API: BufferTarget](https://mediabunny.dev/api/BufferTarget) |
