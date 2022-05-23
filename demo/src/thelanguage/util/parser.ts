import { Message, Token, TokenType } from "../common";

export function printParserOutput(
  input: {
    messages: Message[];
    tokens: Token[];
  },
  text: string
) {
  const messages: Message[] = [];
  const tokens: {
    type: string;
    line: number;
    start: number;
    length: number;
    lexeme: string;
  }[] = [];

  input.messages.forEach((element) => {
    messages.push(element);
  });
  input.tokens.forEach((element) => {
    tokens.push({
      type: TokenType[element.type],
      line: element.line,
      start: element.start,
      length: element.length,
      lexeme: text.slice(element.start, element.start + element.length),
    });
  });

  console.log(messages, tokens);
}

export function isIndianDigit(character: string) {
  return (
    ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"].indexOf(character) > -1
  );
}

export function isArabicDigit(character: string) {
  return (
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(character) > -1
  );
}

export function isDigit(character: string) {
  return isIndianDigit(character) || isArabicDigit(character);
}
