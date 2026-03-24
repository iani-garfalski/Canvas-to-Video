/**
 * Inits the DOM and provides a fixed 1080p drawing surface.
 * Logic resolution (1920x1080) is decoupled from CSS scaling (90vw)
 * to ensure text-wrapping math is resolution-independent.
 * @returns {Object} An object containing the created canvas and its 2D context.
 */
export function setupCanvas() {
  document.body.innerHTML = "";
  Object.assign(document.body.style, { 
    margin: "0", 
    background: "#f0f0f0", 
    height: "100vh", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center" 
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;

  Object.assign(canvas.style, { 
    width: "90vw", 
    height: "auto", 
    backgroundColor: "white", 
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  });

  document.body.appendChild(canvas);
  return { canvas, ctx: canvas.getContext("2d", { alpha: false })! };
}

/**
 * Pre-calculates line breaks once per sentence at the target resolution.
 * CRITICAL: Font must be set before measuring to prevent text clipping.
 * @param ctx - Canvas context for measurement.
 * @param text - Raw sentence string.
 * @param maxWidth - Maximum width allowed before wrapping.
 * @returns {string[]} Array of wrapped lines.
 */
export function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  ctx.font = "bold 80px Arial, sans-serif"; 
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  return lines;
}

/**
 * Universal render call for both UI and Video output.
 * Polymorphic: Accepts string (automatic wrap) or string[] (pre-wrapped fast path).
 * @param ctx - Target 2D context.
 * @param canvas - Target canvas for dimensions.
 * @param content - Text content (string or pre-calculated array).
 * @param opacity - Global alpha value (0-1).
 */
export function draw(ctx: CanvasRenderingContext2D, canvas: { width: number, height: number }, content: string | string[], opacity = 1) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 80px Arial, sans-serif";
  const maxWidth = canvas.width * 0.85;
  const lines = Array.isArray(content) ? content : getWrappedLines(ctx, content, maxWidth);

  ctx.globalAlpha = opacity;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = 110; 
  const y = canvas.height / 2;
  let startY = y - ((lines.length * lineHeight) / 2) + (lineHeight / 2);

  for (const l of lines) {
    ctx.fillText(l, canvas.width / 2, startY);
    startY += lineHeight;
  }
  ctx.globalAlpha = 1.0;
}