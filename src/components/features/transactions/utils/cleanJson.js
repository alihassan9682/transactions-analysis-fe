export function cleanNaNJson(text) {
  return text.replace(/: NaN([,}])/g, ": null$1");
}
