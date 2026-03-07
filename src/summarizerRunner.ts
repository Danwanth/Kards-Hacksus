import { runSummarizer } from "./aiSummarizer";

export function startSummarizer() {

  console.log("Starting AI summarizer...");

  // run immediately
  runSummarizer();

  // run every 20 seconds
  setInterval(() => {

    runSummarizer();

  }, 20000);

}