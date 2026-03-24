# Canvas-to-Video

A high-performance, client-side rendering pipeline that generates 1080p **MOV** files from DOM text using [Mediabunny](https://github.com/Vanilagy/mediabunny).

## Why Mediabunny?
Standard `MediaRecorder` is limited to **real-time** recording (a 30s video takes 30s to export). By using Mediabunny's **WebCodecs** implementation, we achieve **non-real-time encoding**, allowing us to render 1080p video at hardware speeds—often 10x to 20x faster than playback.

## Architecture & Documentation References
Our implementation follows the **Source → Format → Target** pattern defined in the [Mediabunny Guide](https://mediabunny.dev/guide/introduction):

1. **`CanvasSource`**: Acts as the [Media Source](https://mediabunny.dev/guide/media-sources#canvassource). It captures the 1080p offscreen canvas and handles `VideoFrame` creation/disposal to prevent GPU memory leaks.
2. **`MovOutputFormat`**: Used for [Muxing](https://mediabunny.dev/guide/output-formats). It wraps raw H.264 chunks into a **QuickTime (.mov)** container. This provides superior compatibility for native players on both **macOS (QuickTime)** and **Windows**, bypassing common codec errors found in standard MP4 wrappers.
3. **`BufferTarget`**: The [Output Target](https://mediabunny.dev/api/BufferTarget). It accumulates the video bytes into a `Uint8Array` in RAM, enabling an "Instant Download" experience without a backend.
4. **`Output`**: The [Lifecycle Controller](https://mediabunny.dev/api/Output). It synchronizes the tracks and triggers the final metadata write during `finalize()`.

## Engineering Highlights
* **Software-First Encoding**: Configured with `hardwareAcceleration: 'prefer-software'` to ensure maximum stability and prevent GPU driver resets (black blinks) during intensive 1080p renders.
* **Resolution-Independent Math**: We draw at a fixed `1920x1080` internally while using CSS `90vw` for the UI. This ensures text-wrapping remains identical between the preview and the export.
* **Chromium Stability**: Implements a periodic micro-yield (`setTimeout(0)`) every 30 frames to keep the browser main-thread responsive during the encoding loop.
* **Thread Safety**: Implements a `.slice()` defensive copy of the `Uint8Array` to ensure `Blob` compatibility in environments using `SharedArrayBuffer`.

---

### Implementation Summary

| Component | Role | Documentation Link |
| :--- | :--- | :--- |
| **Orchestrator** | `Output` | [API: Output](https://mediabunny.dev/api/Output) |
| **Encoder** | `CanvasSource` | [Guide: Media Sources](https://mediabunny.dev/guide/media-sources#canvassource) |
| **Muxer** | `MovOutputFormat` | [Guide: Output Formats](https://mediabunny.dev/guide/output-formats) |
| **Storage** | `BufferTarget` | [API: BufferTarget](https://mediabunny.dev/api/BufferTarget) |