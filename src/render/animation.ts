import { getDuration } from "../timing/duration";
import { draw } from "./canvas";

/**
 * Loops through curated sentences and plays a synchronized fade-in/out show.
 * @param sentences - Curated text array from the DOM extractor.
 * @param canvas - Visible display canvas for the user.
 * @param isProcessing - Status check for the background recorder overlay.
 * @returns Promise<void> - Resolves when the entire sequence completes.
 */
export async function playSlowAnimation(
  sentences: string[], 
  canvas: HTMLCanvasElement, 
  isProcessing: () => boolean
) {
  const ctx = canvas.getContext("2d")!;
  
  for (const text of sentences) {
    const duration = getDuration(text);
    
    // Sequence: Fade In (800ms) -> Hold (Text Duration) -> Fade Out (800ms)
    await run(ctx, canvas, text, 0, 1, 800, isProcessing); 
    await run(ctx, canvas, text, 1, 1, duration, isProcessing);
    await run(ctx, canvas, text, 1, 0, 800, isProcessing);
  }
}

/**
 * Internal frame-loop controller for a single animation state.
 * @param ctx - Canvas 2D context.
 * @param canvas - Target canvas element.
 * @param text - Sentence string to display.
 * @param from - Start opacity (0-1).
 * @param to - End opacity (0-1).
 * @param ms - Duration of this specific phase in milliseconds.
 * @param status - Callback to determine if the "Recording" dot should render.
 * @returns Promise<void> - Resolves when the timer for this phase hits 100%.
 */
async function run(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  text: string, 
  from: number, 
  to: number, 
  ms: number, 
  status: () => boolean
) {
  return new Promise<void>((resolve) => {
    const start = performance.now();

    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / ms, 1);
      const alpha = from + (to - from) * progress;

      draw(ctx, canvas, text, alpha);
      if (status()) drawStatusDot(ctx, canvas);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

/**
 * Renders a subtle pulsing "Recording" indicator in the top-right corner.
 * @param ctx - Canvas context.
 * @param canvas - Target canvas for positioning math.
 */
function drawStatusDot(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const x = canvas.width - 40;
  const y = 40;
  const radius = 6;
  const pulse = (Math.sin(Date.now() / 200) + 1) / 2; 

  ctx.save();
  // Outer Glow
  ctx.beginPath();
  ctx.arc(x, y, radius + (pulse * 4), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 150, 255, ${0.2 * pulse})`;
  ctx.fill();

  // Core Dot
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0096ff"; 
  ctx.fill();
  ctx.restore();
}