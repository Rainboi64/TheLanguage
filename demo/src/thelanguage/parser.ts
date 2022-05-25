import { Message, Token, TokenType } from "./common";
import { isDigit } from "./util/parser";

export default function parse(input: string) {
  let length = input.length;

  let line = 0;
  let start = 0;
  let idx = 0;

  const isAtEnd = () => !(idx < length);
  const slashZeroIfNull = (val: string) => (val ? val : "\0");

  const current = () => slashZeroIfNull(input[idx]);
  const next = () => slashZeroIfNull(input[idx++]);
  const peek = () => slashZeroIfNull(input[idx + 1]);

  const tokens: Array<Token> = [];
  const messages: Array<Message> = [];

  const token = (type: TokenType) =>
    tokens.push({ type: type, line: line, start: start, length: idx - start });

  function pushError(message: string) {
    messages.push({
      source: "parser",
      type: "error",
      message: message,
      state: { line: line, start: start, length: idx - start },
    });
    return false;
  }

  function checkAndPush(rest: string, type: TokenType) {
    for (let index = 0; index < rest.length; index++) {
      next();
      if (rest[index] !== current()) {
        // backtrack
        idx -= index + 1;
        return false;
      }
    }
    next();
    token(type);
    return true;
  }

  function parseToken() {
    while (idx < length) {
      eatWhitespace();

      start = idx;

      if (isDigit(current())) {
        return Digit();
      }

      switch (current()) {
        case "=":
          if (peek() === "=") {
            next();
            return equalEqual();
          }
          return equal();
        case "!":
          if (peek() === "=") {
            next();
            return bangEqual();
          }
          return bang();
        case "<":
          if (peek() === "=") {
            next();
            return lessEqual();
          }
          return less();
        case ">":
          if (peek() === "=") {
            next();
            return greaterEqual();
          }
          return greater();
        case "(":
          return parenRight();
        case ")":
          return parenLeft();
        case "+":
          return plus();
        case "-":
          if (peek() === "{") {
            next();
            return jsLiteral();
          }
          return minus();
        case "*":
          return multiply();
        case "\\":
          return divide();
        case ",":
          return comma();
        case '"':
          return doubleQuote();
      }

      if (!keyWord()) {
        return Identifier();
      }
    }

    function eatWhitespace() {
      while (true) {
        switch (current()) {
          case " ":
          case "\r":
          case "\t":
            next();
            break;

          case "\n":
            line++;
            next();
            break;

          case "/":
            if (peek() === "/") {
              // A comment goes until the end of the line.
              while (peek() !== "\n" && !isAtEnd()) next();
            } else {
              return;
            }
            break;
          default:
            return;
        }
      }
    }

    function isDestructive(character: string) {
      return (
        character === ")" ||
        character === "(" ||
        character === "," ||
        character === "+" ||
        character === "-" ||
        character === "\n" ||
        character === "\t" ||
        character === "\r" ||
        character === " " ||
        character === "\0"
      );
    }

    function jsLiteral() {
      next();
      while (next() !== "}" && next() !== "-") {
        if (isAtEnd()) {
          pushError("Unterminated JS literal");
          return;
        }
      }

      start++;
      token(TokenType.JSLiteral);

      next();
    }

    function Identifier() {
      next();

      let oncoming = next();
      while (!isDestructive(oncoming)) {
        oncoming = next();
      }

      idx--;
      token(TokenType.Identifier);
    }

    function plus() {
      token(TokenType.Plus);
      next();
    }

    function minus() {
      token(TokenType.Minus);
      next();
    }

    function multiply() {
      token(TokenType.Multiply);
      next();
    }

    function divide() {
      token(TokenType.Divide);
      next();
    }

    function equal() {
      token(TokenType.Equal);
      next();
    }

    function equalEqual() {
      token(TokenType.EqualEqual);
      next();
    }

    function greater() {
      token(TokenType.Greater);
      next();
    }

    function greaterEqual() {
      token(TokenType.GreaterEqual);
      next();
    }

    function less() {
      token(TokenType.Less);
      next();
    }

    function lessEqual() {
      token(TokenType.LessEqual);
      next();
    }

    function bang() {
      token(TokenType.Bang);
      next();
    }

    function bangEqual() {
      token(TokenType.BangEqual);
      next();
    }

    // '"'
    function doubleQuote() {
      next();

      while (next() !== '"') {
        if (isAtEnd()) {
          pushError("Unterminated String");
          return;
        }
      }
      token(TokenType.String);
    }

    function Digit() {
      let hasDecimalPoint = false;
      const isDecimalPoint = () => {
        if (hasDecimalPoint) {
          return false;
        }

        if (current() === ",") {
          hasDecimalPoint = true;
          return hasDecimalPoint;
        }

        return false;
      };

      while (isDigit(current()) || isDecimalPoint()) {
        next();
      }

      token(TokenType.Number);
    }

    // ','
    function comma() {
      token(TokenType.Comma);
      next();
    }

    // '('
    function parenLeft() {
      token(TokenType.CloseParen);
      next();
    }

    // ')'
    function parenRight() {
      token(TokenType.OpenParen);
      next();
    }

    function keyWord() {
      return (
        hamza() ||
        upHamzaAleph() ||
        downHamzaAleph() ||
        aleph() ||
        baa() ||
        taa() ||
        thaa() ||
        jeem() ||
        haa() ||
        khaa() ||
        dal() ||
        raa() ||
        zay() ||
        seen() ||
        sheen() ||
        sad() ||
        dadd() ||
        ttaa() ||
        zaa() ||
        ain() ||
        ghain() ||
        faa() ||
        kaff() ||
        keff() ||
        lam() ||
        meem() ||
        noon() ||
        haah() ||
        waw() ||
        yaa()
      );
    }

    // 'ء'
    function hamza() {
      return false;
    }

    // 'أ'
    function upHamzaAleph() {
      return false;
    }

    // 'إ'
    function downHamzaAleph() {
      if (current() === "إ") if (checkAndPush("ذا ", TokenType.Or)) return true;
      return false;
    }

    // 'ا'
    function aleph() {
      if (current() === "ا") {
        if (checkAndPush("و ", TokenType.Or)) return true;
        else if (checkAndPush("نتهى", TokenType.End)) return true;
        else if (checkAndPush("طبع ", TokenType.Print)) return true;
      }
      return false;
    }

    // 'ب'
    function baa() {
      return false;
    }

    // 'ت'
    function taa() {
      if (current() === "ت")
        if (checkAndPush("ابع ", TokenType.Fun)) return true;
      return false;
    }

    // 'ث'
    function thaa() {
      return false;
    }

    // 'ج'
    function jeem() {
      return false;
    }

    // 'ح'
    function haa() {
      return false;
    }

    // 'خ'
    function khaa() {
      if (current() === "خ")
        if (checkAndPush("طأ ", TokenType.False)) return true;
      return false;
    }

    // 'د'
    function dal() {
      return false;
    }

    // 'ر'
    function raa() {
      return false;
    }

    // 'ز'
    function zay() {
      return false;
    }

    // 'س'
    function seen() {
      return false;
    }

    // 'ش'
    function sheen() {
      if (current() === "ش")
        if (checkAndPush("يء ", TokenType.Var)) return true;
      return false;
    }

    // 'ص'
    function sad() {
      if (current() === "ص")
        if (checkAndPush("حيح ", TokenType.True)) return true;
      return false;
    }

    // 'ض'
    function dadd() {
      return false;
    }

    // 'ط'
    function ttaa() {
      if (current() === "ط")
        if (checkAndPush("الما ", TokenType.While)) return true;
      return false;
    }

    // 'ظ'
    function zaa() {
      return false;
    }

    // 'ع'
    function ain() {
      return false;
    }

    // 'غ'
    function ghain() {
      return false;
    }

    // 'ف'
    function faa() {
      if (current() === "ف")
        if (checkAndPush("راغ ", TokenType.Nil)) return true;
      return false;
    }

    // 'ق'
    function keff() {
      return false;
    }

    // 'ك'
    function kaff() {
      return false;
    }

    // 'ل'
    function lam() {
      if (current() === "ل")
        if (checkAndPush("كل ", TokenType.For)) return true;
      return false;
    }

    // 'م'
    function meem() {
      return false;
    }

    // 'ن'
    function noon() {
      if (current() === "ن")
        if (checkAndPush("وع ", TokenType.Class)) return true;
      return false;
    }

    // 'ه'
    function haah() {
      return false;
    }

    // 'و'
    function waw() {
      if (current() === "و") if (checkAndPush(" ", TokenType.And)) return true;
      return false;
    }

    // 'ي'
    function yaa() {
      return false;
    }
  }

  while (idx < length) {
    parseToken();
  }

  token(TokenType.EOF);

  return {
    messages: messages,
    tokens: tokens,
  };
}
