const words = [
  "monkey",
  "table",
  "rocket",
  "banana",
  "panda",
  "tiger",
  "ninja",
  "robot",
  "wizard",
  "dragon"
];

export function generateUsername() {

  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(Math.random() * 100);

  return `${word}${number}`;
}