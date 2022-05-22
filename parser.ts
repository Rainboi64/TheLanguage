export enum TokenType {
    // One or two character tokens.
    Comma, Bang, BangEqual,
    Equal, EqualEqual,
    Greater, GreaterEqual,
    Less, LessEqual,
    And, // و
    Or, // او

    // Literals.
    Identifier, String, Number,

    Class, // نوع
    Else, // وإلا
    False, // خطأ
    Fun, // تابع
    For, // لكل
    If, // إذا
    Nil, // فراغ
    Print, // اطبع
    Return, // ارجع
    True, // صحيح
    Var, // شيء
    While, // طالما
    End, // انته

    Eof
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
    let idx = 0;
     
    const current = () => input[idx]
    const next = () => input[idx++]
    const peek = () => input[idx + 1]
    const jump = (i: number) => input[idx += i]

    const tokens: Array<Token> = []
    const messages: Array<Message> = []
    
    function pushError(message: string) {
        messages.push({type: "error", message: message})
    }

    function pushWarning(message: string) {
        messages.push({type: "warning", message: message})
    }

    function parseToken()
    {
        while (idx < length)
        {
            switch (Current())
            {
                case 'ء':
                    return Hamza();
                case 'أ':
                    return UpHamzaAleph();
                    
                case 'إ':
                    return DownHamzaAleph();
                    
                case 'ا':
                    return Aleph();
                    
                case 'ب':
                    return Baa();
                    
                case 'ت':
                    return Taa();
                    
                case 'ث':
                    return Thaa();
                    
                case 'ج':
                    return Jeem();
                    
                case 'ح':
                    return Haa();
                    
                case 'خ':
                    return Khaa();
                    
                case 'د':
                    return Dal();
                    
                case 'ر':
                    return Raa();
                    
                case 'ز':
                    return Zay();
                    
                case 'س':
                    return Seen();
                    
                case 'ش':
                    return Sheen();
                    
                case 'ص':
                    return Sad();
                    
                case 'ض':
                    return Dadd();
                    
                case 'ط':
                    return Ttaa();
                    
                case 'ظ':
                    return Zaa();
                    
                case 'ع':
                    return Ain();
                    
                case 'غ':
                    return Ghain();
                    
                case 'ف':
                    return Faa();
                    
                case 'ق':
                    return Kaff();
                    
                case 'ك':
                    return Keff();
                    
                case 'ل':
                    return Lam();
                    
                case 'م':
                    return Meem();
                    
                case 'ن':
                    return Noon();
                    
                case 'ه':
                    return Haah();
                    
                case 'و':
                    return Waw();
                    
                case 'ي':
                    return Yaa();
                    
                case '\t':
                    return Tab();
                    
                case ' ':
                    return Space();
                    
                case '(':
                    return ParenRight();
                    
                case ')':
                    return ParenLeft();
                    
                case ',':
                    return Comma();
                    
                case '"':
                    return DoubleQuote();
                    
                case '\n':
                    return NewLine();
                default:
                    SyntaxError("Unexpected Character");
                    break;
            }

            idx++;
        }
    }

        

    return {
        messages: messages,
        tokens: tokens
    };
}