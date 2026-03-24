import { extractVisibleText } from "./dom/extractor";
import { splitIntoSentences } from "./text/sentences";
import { curateSentences } from "./text/curator";
import { setupCanvas } from "./render/canvas";
import { recordInstantVideo } from "./output/recorder";
import { playSlowAnimation } from "./render/animation";

(async function init() {
  const text = extractVisibleText();
  const rawSentences = splitIntoSentences(text);
  const sentences = curateSentences(rawSentences);

  const { canvas } = setupCanvas();
  let recording = true;

  // Background render starts immediately; non-blocking
  recordInstantVideo(sentences, () => {
    recording = false;
  }).catch(e => {
    recording = false;
    console.error("Render pipeline failed:", e);
  });

  // Play the visual show while the video encodes in the background
  await playSlowAnimation(sentences, canvas, () => recording);
})();