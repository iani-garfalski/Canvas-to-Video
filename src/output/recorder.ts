import { Output, BufferTarget, CanvasSource, MovOutputFormat } from 'mediabunny';
import { getDuration } from "../timing/duration";
import { draw, getWrappedLines } from '../render/canvas';

/**
 * Encodes text sentences into a QuickTime MOV video file using software encoding.
 * @param sentences - Array of strings to be rendered into video frames.
 * @param onComplete - Callback executed when the process finishes or fails.
 * @returns {Promise<void>} Resolves when the recording and cleanup are complete.
 */
export async function recordInstantVideo(sentences: string[], onComplete: () => void): Promise<void> {
  const [W, H, FPS] = [1920, 1080, 30];
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d", { alpha: false })!;
  
  const output = new Output({ format: new MovOutputFormat(), target: new BufferTarget() });

  const video = new CanvasSource(canvas, { 
    codec: 'avc', 
    bitrate: 4_000_000,
    hardwareAcceleration: 'prefer-software',
    ...({ useWorker: true } as any) 
  } as any);

  try {
    output.addVideoTrack(video);
    await output.start();

    let ts = 0;
    const step = 1 / FPS;

    for (const text of sentences) {
      const lines = getWrappedLines(ctx, text, W * 0.85);
      const frames = Math.ceil((getDuration(text) + 800) / 1000 * FPS);

      for (let i = 0; i < frames; i++) {
        draw(ctx, canvas, lines, getAlpha(i, frames));
        await video.add(ts, step);
        ts += step;

        if (i % 30 === 0) await new Promise(r => setTimeout(r, 0));
      }
      if ((video as any).flush) await (video as any).flush();
    }

    await output.finalize();
    const buf = (output.target as BufferTarget).buffer;
    if (buf) download(new Uint8Array(buf));

  } catch (e) {
    console.error("MOV Recording failed:", e);
  } finally {
    onComplete();
  }
}

/**
 * Calculates transition alpha for a specific frame index to create fade effects.
 * @param i - The current frame index.
 * @param total - The total number of frames for the current sentence.
 * @returns {number} The calculated opacity value (0.0 to 1.0).
 */
function getAlpha(i: number, total: number): number {
  const f = 12; // 0.4s @ 30fps
  return i < f ? i / f : i > total - f ? 1 - (i - (total - f)) / f : 1;
}

/**
 * Creates a Blob from the byte buffer and triggers a browser file download.
 * @param data - The raw video data from the BufferTarget.
 * @returns {void}
 */
function download(data: Uint8Array): void {
  // Use .slice() to ensure the data is compatible with Blob constructor
  const blob = new Blob([data.slice()], { type: "video/quicktime" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { 
    href: url, 
    download: `video-${Date.now()}.mov` 
  });
  link.click();
  
  // Cleanup memory
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}