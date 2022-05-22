import { isDigit } from "./util/parser";

export enum TokenType {
    // One or two character tokens.
    OpenParen, // ✅
    CloseParen, // ✅
    Comma, // ✅
    Bang, BangEqual,
    Equal, EqualEqual,
    Greater, GreaterEqual,
    Less, LessEqual,
    And, // ✅ و
    Or, // ✅ او

    // Literals.
    Identifier,
    JSLiteral,
    String, // ✅
    Number, // 

    Class, // ✅ نوع
    Else, // ✅ وإلا
    False, // ✅ خطأ
    Fun, // ✅ تابع
    For, // ✅ لكل
    If, // ✅ إذا
    Nil, // ✅ فراغ
    Print, // ✅ اطبع
    Return, // ✅ أرجع
    True, // ✅ صحيح
    Var, // ✅ شيء
    While, // ✅ طالما
    End, // ✅ انتهى
}

export interface Token {
    type: TokenType,
    line: number,
    start: number,
    length: number,
}

export interface Message {
    type: string,
    message: string
}

export default function parse(input: string) {
    let length = input.length;

    let line = 0;
    let start = 0;
    let idx = 0;
    
    const isAtEnd = () => !(idx < length - 1)
    const slashZeroIfNull = (val: string) => val ? val : '\0'

    const current        = ()          => slashZeroIfNull(input[idx     ])
    const next           = ()          => slashZeroIfNull(input[idx++   ])
    const peek           = ()          => slashZeroIfNull(input[idx +  1])
    const lookforward    = (i: number) => slashZeroIfNull(input[idx +  i])
    const jump           = (i: number) => slashZeroIfNull(input[idx += i])

    const tokens  : Array<Token>   = []
    const messages: Array<Message> = []
    
    const token   = (type: TokenType                ) => tokens.push({type: type, line: line, start: start, length: idx - start})

    function pushError(message: string) {
        messages.push({type: "error", message: message})
        return false
    }

    function pushWarning(message: string) {
        messages.push({type: "warning", message: message})
    }

    const InvalidKeyword = () => pushError("Invalid Keyword");

    function checkAndPush (rest: string, type: TokenType) {
        for (let index = 0; index < rest.length; index++) {
            next();
            if (rest[index] != current())
            {
                // backtrack
                idx -= index + 1;
                return false
            }
        }
        next()
        token(type)
        return true
    }

    function parseToken() {
        while (idx < length) {
            eatWhitespace()
            
            start = idx;

            if(isDigit(current()))
            {
                return Digit();
            }

            switch (current())
            {
                case '(':
                    return parenRight();
                case ')':
                    return parenLeft();
                case ',':
                    return comma();
                case '"':
                    return doubleQuote();
            }

            if(!keyWord()) 
            {
                return Identifier()
            }
        }

        function eatWhitespace()
        {
            while(true)
            {
                switch(current())
                {
                    case ' ':
                    case '\r':
                    case '\t':
                        next();
                    break;

                    case '\n':
                        line++;
                        next();
                    break;

                    case '/':
                        if (peek() == '/')
                        {
                            // A comment goes until the end of the line.
                            while (peek() != '\n' && !isAtEnd()) next();
                        }
                        else
                        {
                            return;
                        }
                    break;

                    default:
                    return
                }
            }
        }

        function Identifier() {
            token(TokenType.Identifier)
        }
    
        // '"'
        function doubleQuote() {
            while(next() == '\"' && lookforward(-1) != "\\")
            {
                if(isAtEnd())
                {
                    pushError("Unterminated String")
                }
            }
            token(TokenType.String)
        }

        function Digit() {
            let hasDecimalPoint = false;
            const isDecimalPoint = () => {
                if(hasDecimalPoint)
                {
                    return false;
                }

                if(current() == ',') {
                    hasDecimalPoint = true;
                    return hasDecimalPoint;
                }

                return false
            }

            while(isDigit(current()) || isDecimalPoint())
            {
                next()
            }

            token(TokenType.Number)
        }

        // ','
        function comma() {
            token(TokenType.Comma)
            next()
        }

        // '('
        function parenLeft() {
            token(TokenType.OpenParen)
            next()
        }

        // ')'
        function parenRight() {
            token(TokenType.CloseParen)
            next()
        }

        function keyWord() { 
            return (
                hamza()           ||
                upHamzaAleph()    ||
                downHamzaAleph()  ||
                aleph()           ||
                baa()             ||
                taa()             ||
                thaa()            ||
                jeem()            ||
                haa()             ||
                khaa()            ||
                dal()             ||
                raa()             ||
                zay()             ||
                seen()            ||
                sheen()           ||
                sad()             ||
                dadd()            ||
                ttaa()            ||      
                zaa()             ||
                ain()             ||
                ghain()           ||
                faa()             ||
                kaff()            ||
                keff()            ||
                lam()             ||
                meem()            ||
                noon()            ||
                haah()            ||
                waw()             ||
                yaa()
            );
        }

        // 'ء'
        function hamza() { return false }

        // 'أ'
        function upHamzaAleph() { return false }

        // 'إ'
        function downHamzaAleph() {
            if (checkAndPush("ذا ", TokenType.Or)) return true
            else false
        }

        // 'ا'
        function aleph(){
            if (checkAndPush("و ", TokenType.Or)) return true
            else if (checkAndPush("نتهى ", TokenType.End)) return true
            else if (checkAndPush("طبع ", TokenType.Print)) return true
            else return false
        }

        // 'ب'
        function baa() { return false }

        // 'ت'
        function taa() {
            if(checkAndPush("ابع ", TokenType.Fun)) return true
            else return false
        }
        
        // 'ث'
        function thaa() { return false }
        
        // 'ج'
        function jeem() { return false }
        
        // 'ح'
        function haa() { return false }
        
        // 'خ'
        function khaa() {
            if (checkAndPush("طأ ", TokenType.False)) return true
            else return false
        }
        
        // 'د'
        function dal() { return false }
        
        // 'ر'
        function raa() { return false }
        
        // 'ز'
        function zay() { return false }
        
        // 'س'
        function seen() { return false }
        
        // 'ش'
        function sheen() {
            if (checkAndPush("يء ", TokenType.Var)) return true
            else false;
        }
        
        // 'ص'
        function sad() {
            if (checkAndPush("حيح ", TokenType.True)) return true
            else return false;
        }
        
        // 'ض'
        function dadd() { return false }

        // 'ط'
        function ttaa() {
            if (checkAndPush("الما ", TokenType.While)) return true
            else return false;
        }
        
        // 'ظ'
        function zaa() { return false }
        
        // 'ع'
        function ain() { return false }
        
        // 'غ'
        function ghain() { return false }
        
        // 'ف'
        function faa() {
            if (checkAndPush("راغ ", TokenType.Nil)) return true
            else return false
        }
        
        // 'ق'
        function keff() { return false }
        
        // 'ك'
        function kaff() { return false }
        
        // 'ل'
        function lam() {
            if (checkAndPush("كل ", TokenType.For)) return true
            else return false
        }

        // 'م'
        function meem() { return false }

        // 'ن'
        function noon() {
            if (checkAndPush("وع ", TokenType.Class)) return true
            else return false
        }

        // 'ه'
        function haah() { return false }

        // 'و'
        function waw() {
            if (checkAndPush(" ", TokenType.And)) return true
            else return false
        }

        // 'ي'
        function yaa() { return false }
    }

    while (idx < length) {
        parseToken()
    }

    return {
        messages: messages,
        tokens: tokens
    };
}