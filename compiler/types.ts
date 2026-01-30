
export enum TokenType {
  KW_INT, KW_IF, KW_ELSE, KW_WHILE, KW_PRINT,
  ID, NUM,
  PLUS, MINUS, STAR, SLASH, PERCENT,
  ASSIGN, EQ, NE, LT, GT, LE, GE,
  LPAREN, RPAREN, LBRACE, RBRACE, SEMI,
  EOF, ERROR
}

export interface Token {
  type: TokenType;
  lexeme: string;
  line: number;
  col: number;
}

export enum OpCode {
  PUSH_INT,
  LOAD,
  STORE,
  ADD, SUB, MUL, DIV, MOD,
  CMP_EQ, CMP_NE, CMP_LT, CMP_GT, CMP_LE, CMP_GE,
  JMP,
  JMP_IF_FALSE,
  PRINT,
  HALT
}

export interface Instruction {
  op: OpCode;
  operand?: number;
  comment?: string;
}
