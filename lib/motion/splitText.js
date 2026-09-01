// Split manual (sem GSAP SplitText, plugin pago do Club GreenSock) para permitir
// stagger por caractere/palavra nos 2 únicos pontos do protótipo que usam isso:
// o wordmark da Hero e a headline de fechamento do Contact.
export function splitChars(text) {
  return text.split("").map((char, index) => ({
    key: `${char}-${index}`,
    char: char === " " ? " " : char,
  }));
}

export function splitWords(text) {
  return text.split(" ").map((word, index) => ({
    key: `${word}-${index}`,
    word,
  }));
}
