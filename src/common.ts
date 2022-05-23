export interface Message {
  source: string;
  type: string;
  message: string;
  state?: {};
}

export enum TokenType {
  // One or two character tokens.
  OpenParen, // ✅
  CloseParen, // ✅
  Comma, // ✅
  Bang,
  BangEqual,
  Equal, // ✅
  EqualEqual,
  Greater,
  GreaterEqual,
  Less,
  LessEqual,
  And, // ✅ و
  Or, // ✅ او

  // Literals.
  Identifier, // ✅
  JSLiteral,
  String, // ✅
  Number, // ✅

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
  type: TokenType;
  line: number;
  start: number;
  length: number;
}
