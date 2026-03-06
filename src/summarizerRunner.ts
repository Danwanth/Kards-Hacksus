import { summarizeGroup } from "./aiSummarizer";

export function startSummarizer() {

  setInterval(() => {

    summarizeGroup(1);
    summarizeGroup(2);
    summarizeGroup(3);

  }, 300000); // every 5 minutes

}