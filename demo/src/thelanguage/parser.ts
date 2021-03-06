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

    // '??'
    function hamza() {
      return false;
    }

    // '??'
    function upHamzaAleph() {
      return false;
    }

    // '??'
    function downHamzaAleph() {
      if (current() === "??") if (checkAndPush("???? ", TokenType.Or)) return true;
      return false;
    }

    // '??'
    function aleph() {
      if (current() === "??") {
        if (checkAndPush("?? ", TokenType.Or)) return true;
        else if (checkAndPush("????????", TokenType.End)) return true;
        else if (checkAndPush("?????? ", TokenType.Print)) return true;
      }
      return false;
    }

    // '??'
    function baa() {
      return false;
    }

    // '??'
    function taa() {
      if (current() === "??")
        if (checkAndPush("?????? ", TokenType.Fun)) return true;
      return false;
    }

    // '??'
    function thaa() {
      return false;
    }

    // '??'
    function jeem() {
      return false;
    }

    // '??'
    function haa() {
      return false;
    }

    // '??'
    function khaa() {
      if (current() === "??")
        if (checkAndPush("???? ", TokenType.False)) return true;
      return false;
    }

    // '??'
    function dal() {
      return false;
    }

    // '??'
    function raa() {
      return false;
    }

    // '??'
    function zay() {
      return false;
    }

    // '??'
    function seen() {
      return false;
    }

    // '??'
    function sheen() {
      if (current() === "??")
        if (checkAndPush("???? ", TokenType.Var)) return true;
      return false;
    }

    // '??'
    function sad() {
      if (current() === "??")
        if (checkAndPush("?????? ", TokenType.True)) return true;
      return false;
    }

    // '??'
    function dadd() {
      return false;
    }

    // '??'
    function ttaa() {
      if (current() === "??")
        if (checkAndPush("???????? ", TokenType.While)) return true;
      return false;
    }

    // '??'
    function zaa() {
      return false;
    }

    // '??'
    function ain() {
      return false;
    }

    // '??'
    function ghain() {
      return false;
    }

    // '??'
    function faa() {
      if (current() === "??")
        if (checkAndPush("?????? ", TokenType.Nil)) return true;
      return false;
    }

    // '??'
    function keff() {
      return false;
    }

    // '??'
    function kaff() {
      return false;
    }

    // '??'
    function lam() {
      if (current() === "??")
        if (checkAndPush("???? ", TokenType.For)) return true;
      return false;
    }

    // '??'
    function meem() {
      return false;
    }

    // '??'
    function noon() {
      if (current() === "??")
        if (checkAndPush("???? ", TokenType.Class)) return true;
      return false;
    }

    // '??'
    function haah() {
      return false;
    }

    // '??'
    function waw() {
      if (current() === "??") if (checkAndPush(" ", TokenType.And)) return true;
      return false;
    }

    // '??'
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
