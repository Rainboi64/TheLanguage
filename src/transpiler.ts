import { Message, Token, TokenType } from "./common";

export default function transpile(tokens: Array<Token>, src: string)
{
    const dictionary:{[arabicIdx: string] : string} = {}
    const length = tokens.length;
    let idx = 0;

    const current = () => (tokens[idx])
    const next = () => (tokens[idx++])
    const peek = () => (tokens[idx+1])

    const currentType = () => (tokens[idx]).type
    const nextType = () => (tokens[idx++]).type
    const peekType = () => (tokens[idx+1]).type

    const messages: Array<Message> = []

    let output: Array<String> = [];
    let buffer: string = "";

    function pushError(message: string) {
        messages.push({source: "parser", type: "error", message: message})
        return false
    }

    function pushWarning(message: string) {
        messages.push({source: "parser", type: "warning", message: message})
    }

    const expectedButFound = (expected: Array<TokenType>, found: TokenType) => pushError(`Invalid token, expected "${expected.map((exp, i)=> TokenType[exp] + ` ${i < expected.length ? "or " : ""}`)}" but found "${TokenType[found]}"`);
    const ensureNextIs = (type: TokenType) => {
        next()
        if(currentType() == type)
        {
            return true;
        }
        else
        {
            expectedButFound([type], currentType())
            return false;
        }
    }

    while(idx < length) {
        switch(currentType()) {
            case TokenType.Var:
                variable();
            break;
            case TokenType.Print:
                print();
                break;

            default: 
                break;
        }

        // reset short buffer
        output.push(buffer)
        buffer = "";

        next()
    }

    function print()
    {
        next()
        switch(currentType())
        {
            case TokenType.Identifier: 
                buffer = `console.log(${identifier(current())});`
            break;
            case TokenType.String:
                buffer = `console.log(${string(current())});`
            break;
            
            default:
                expectedButFound([TokenType.Identifier,  TokenType.String], currentType())
                break;
        }
    }

    function variable()
    {
        if(ensureNextIs(TokenType.Identifier)) {
            const name = value(current())
            if(ensureNextIs(TokenType.Equal)) {
                next();
                switch(currentType()) {
                    case TokenType.Identifier: 
                        dictionary[name] = latinize(name);
                        buffer = `let ${dictionary[name]} = ("${identifier(current())}");`
                    break;
                    case TokenType.String:
                        dictionary[name] = latinize(name);
                        buffer = `let ${dictionary[name]} = (${string(current())});`
                    break;
                    case TokenType.Number:
                        dictionary[name] = latinize(name);
                        buffer = `let ${dictionary[name]} = (${number(current())});`
                    break;
                    default:
                        expectedButFound([TokenType.Identifier,  TokenType.String, TokenType.Number], currentType())
                        break;
                }
            }
        }
    }

    function value(token: Token)
    {
        return src.substring(token.start, token.start + token.length)
    }

    function number(token: Token)
    {
        // TODO: Replace Indian numerials
        return src.substring(token.start, token.start + token.length)
        .replace(",", ".")
    }

    function identifier(token: Token)
    {
        return dictionary[src.substring(token.start, token.start + token.length)]
    }

    function string(token: Token)
    {
        return src.substring(token.start, token.start + token.length)
    }

    function latinize(arabic: string)
    {
        // TODO: use hash functions
        return arabic;
    }

    return { src: output, messages: messages }
}