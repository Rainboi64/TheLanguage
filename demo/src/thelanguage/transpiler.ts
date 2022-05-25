import { Message, Token, TokenType } from "./common";

export default function transpile(tokens: Array<Token>, src: string) {
  const dictionary: { [arabicIdx: string]: string } = {};
  const length = tokens.length;
  let idx = 0;

  const current = () => tokens[idx];
  const next = () => tokens[idx++];
  const peek = () => tokens[idx + 1];

  const jump = (i: number) => {
    idx += i;
  };

  const currentType = () => tokens[idx].type;
  const nextType = () => tokens[idx++].type;
  const peekType = () => tokens[idx + 1].type;

  const messages: Array<Message> = [];

  let output: Array<String> = [];
  let buffer: string = "";

  output.push("/* START OF LANGUAGE BUFFER */\n\n");

  function pushError(message: string) {
    messages.push({
      source: "transpiler",
      type: "error",
      state: {
        idx: idx,
        current: current(),
        currentTypeName: TokenType[currentType()],
      },
      message: message,
    });
    return false;
  }

  const expectedButFound = (expected: Array<TokenType>, found: TokenType) =>
    pushError(
      `Invalid token, expected "${expected.map(
        (exp, i) => TokenType[exp] + ` ${i < expected.length ? "or " : ""}`
      )}" but found "${TokenType[found]}"`
    );
  const ensureNextIs = (type: TokenType) => {
    next();
    if (currentType() === type) {
      return true;
    } else {
      expectedButFound([type], currentType());
      return false;
    }
  };

  while (idx < length) {
    switch (currentType()) {
      case TokenType.Var:
        variable();
        break;
      case TokenType.Print:
        print();
        break;
      case TokenType.For:
        forloop();
        break;
      case TokenType.While:
        whileloop();
        break;
      case TokenType.Fun:
        fun();
        break;
      case TokenType.Identifier:
        funcall();
        break;
      case TokenType.JSLiteral:
        jsLiteral();
        break;
      case TokenType.End:
        end();
        break;
      case TokenType.EOF:
        buffer = "\n\n/* END OF LANGUAGE BUFFER */";
        break;
      default:
        pushError("Invalid start to statement.");
        break;
    }

    // reset short buffer
    output.push(buffer);
    buffer = "";

    next();
  }

  function expr() {
    switch (currentType()) {
      case TokenType.Identifier:
        const rightSide = identifier(current());
        switch (peekType()) {
          case TokenType.Plus:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${rightSide} + ${identifier(current())})`;
              case TokenType.String:
                return `(${rightSide} + ${identifier(current())})`;
              case TokenType.Number:
                return `(${rightSide} + ${identifier(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
                return;
            }

          case TokenType.Minus:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${rightSide} - ${identifier(current())})`;
              case TokenType.Number:
                return `(${rightSide} - ${identifier(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;

          case TokenType.Multiply:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${rightSide} * ${identifier(current())})`;
              case TokenType.Number:
                return `(${rightSide} * ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;

          case TokenType.Divide:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${rightSide} / ${identifier(current())})`;
              case TokenType.Number:
                return `(${rightSide} / ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;
          default:
            return rightSide;
        }
        break;

      case TokenType.String:
        const srightSide = string(current());
        if (peekType() === TokenType.Plus) {
          jump(2);
          switch (currentType()) {
            case TokenType.Identifier:
              return `(${srightSide} + ${identifier(current())})`;
            case TokenType.String:
              return `(${srightSide} + ${string(current())})`;
            default:
              expectedButFound(
                [TokenType.Identifier, TokenType.String],
                currentType()
              );
          }
        } else {
          return srightSide;
        }
        break;

      case TokenType.Number:
        const nrightSide = number(current());
        switch (peekType()) {
          case TokenType.Plus:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${nrightSide} + ${identifier(current())})`;
              case TokenType.Number:
                return `(${nrightSide} + ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;
          case TokenType.Minus:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${nrightSide} - ${identifier(current())})`;
              case TokenType.Number:
                return `(${nrightSide} - ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;
          case TokenType.Multiply:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${nrightSide} * ${identifier(current())})`;
              case TokenType.Number:
                return `(${nrightSide} * ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;
          case TokenType.Divide:
            jump(2);
            switch (currentType()) {
              case TokenType.Identifier:
                return `(${nrightSide} / ${identifier(current())})`;
              case TokenType.Number:
                return `(${nrightSide} / ${number(current())})`;
              default:
                expectedButFound(
                  [TokenType.Identifier, TokenType.Number],
                  currentType()
                );
            }
            break;
          default:
            return nrightSide;
        }
        break;
    }
  }

  function end() {
    buffer = `}`;
  }

  function forloop() {}

  function whileloop() {
    buffer = `while(${expr()}) {`;
  }

  function fun() {
    if (!ensureNextIs(TokenType.Identifier)) {
      expectedButFound([TokenType.Identifier], currentType());
      return;
    }

    dictionary[value(current())] = latinize(value(current()));

    const name = identifier(current());
    const params: string[] = [];

    function param() {
      next();
      switch (currentType()) {
        case TokenType.Identifier:
          const val = value(current());
          dictionary[val] = latinize(val);

          params.push(latinize(val));
          if (peekType() === TokenType.Comma) {
            next();
            param();
          }
          break;
      }
    }

    if (ensureNextIs(TokenType.OpenParen)) {
      param();
      if (ensureNextIs(TokenType.CloseParen)) {
        buffer = `function ${name} (${params.join(",")}) {`;
      }
    }
  }

  function funcall() {
    if (peekType() !== TokenType.OpenParen) {
      expectedButFound([TokenType.OpenParen], currentType());
      return;
    }

    const name = identifier(current());
    const params: string[] = [];

    function param() {
      next();
      const _expr = expr();
      if (_expr) {
        params.push(_expr);
      }

      if (peekType() === TokenType.Comma) {
        next();
        param();
      }
    }

    if (ensureNextIs(TokenType.OpenParen)) {
      param();
      if (ensureNextIs(TokenType.CloseParen)) {
        buffer = `${name}(${params.join()})`;
      }
    }
  }

  function jsLiteral() {
    buffer = value(current());
  }

  function print() {
    next();
    switch (currentType()) {
      case TokenType.Identifier:
        buffer = `console.log(${expr()});`;
        break;
      case TokenType.String:
        buffer = `console.log(${expr()});`;
        break;
      case TokenType.Number:
        buffer = `console.log(${expr()});`;
        break;

      default:
        expectedButFound(
          [TokenType.Identifier, TokenType.String, TokenType.Number],
          currentType()
        );
        break;
    }
  }

  function variable() {
    if (ensureNextIs(TokenType.Identifier)) {
      const name = value(current());
      if (ensureNextIs(TokenType.Equal)) {
        next();
        switch (currentType()) {
          case TokenType.Identifier:
            dictionary[name] = latinize(name);
            buffer = `let ${dictionary[name]} = ("${expr()}");`;
            break;
          case TokenType.String:
            dictionary[name] = latinize(name);
            buffer = `let ${dictionary[name]} = (${string(current())});`;
            break;
          case TokenType.Number:
            dictionary[name] = latinize(name);
            buffer = `let ${dictionary[name]} = (${number(current())});`;
            break;
          default:
            expectedButFound(
              [TokenType.Identifier, TokenType.String, TokenType.Number],
              currentType()
            );
            break;
        }
      }
    }
  }

  function value(token: Token) {
    return src.slice(token.start, token.start + token.length);
  }

  function number(token: Token) {
    // TODO: Replace Indian numerials
    return src.slice(token.start, token.start + token.length).replace(",", ".");
  }

  function identifier(token: Token) {
    return dictionary[src.slice(token.start, token.start + token.length)];
  }

  function string(token: Token) {
    return src.substring(token.start, token.start + token.length);
  }

  function latinize(arabic: string) {
    // TODO: use hash functions
    return arabic;
  }

  return { src: output, messages: messages };
}
