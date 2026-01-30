
import { TokenType, Token } from './types';

export class Lexer {
  private pos = 0;
  private line = 1;
  private col = 1;

  constructor(private input: string) {}

  private isAtEnd() {
    return this.pos >= this.input.length;
  }

  private peek() {
    return this.isAtEnd() ? '\0' : this.input[this.pos];
  }

  private advance() {
    const char = this.peek();
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return char;
  }

  private skipWhitespace() {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\r' || char === '\t' || char === '\n') {
        this.advance();
      } else if (char === '/' && this.input[this.pos + 1] === '/') {
        // Line comment
        while (!this.isAtEnd() && this.peek() !== '\n') this.advance();
      } else {
        break;
      }
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const startLine = this.line;
      const startCol = this.col;
      const char = this.advance();

      if (this.isDigit(char)) {
        let num = char;
        while (this.isDigit(this.peek())) num += this.advance();
        tokens.push({ type: TokenType.NUM, lexeme: num, line: startLine, col: startCol });
      } else if (this.isAlpha(char)) {
        let id = char;
        while (this.isAlphaNumeric(this.peek())) id += this.advance();
        tokens.push({ type: this.keywordOrId(id), lexeme: id, line: startLine, col: startCol });
      } else {
        switch (char) {
          case '+': tokens.push({ type: TokenType.PLUS, lexeme: '+', line: startLine, col: startCol }); break;
          case '-': tokens.push({ type: TokenType.MINUS, lexeme: '-', line: startLine, col: startCol }); break;
          case '*': tokens.push({ type: TokenType.STAR, lexeme: '*', line: startLine, col: startCol }); break;
          case '/': tokens.push({ type: TokenType.SLASH, lexeme: '/', line: startLine, col: startCol }); break;
          case '%': tokens.push({ type: TokenType.PERCENT, lexeme: '%', line: startLine, col: startCol }); break;
          case '(': tokens.push({ type: TokenType.LPAREN, lexeme: '(', line: startLine, col: startCol }); break;
          case ')': tokens.push({ type: TokenType.RPAREN, lexeme: ')', line: startLine, col: startCol }); break;
          case '{': tokens.push({ type: TokenType.LBRACE, lexeme: '{', line: startLine, col: startCol }); break;
          case '}': tokens.push({ type: TokenType.RBRACE, lexeme: '}', line: startLine, col: startCol }); break;
          case ';': tokens.push({ type: TokenType.SEMI, lexeme: ';', line: startLine, col: startCol }); break;
          case '=': 
            if (this.peek() === '=') { this.advance(); tokens.push({ type: TokenType.EQ, lexeme: '==', line: startLine, col: startCol }); }
            else tokens.push({ type: TokenType.ASSIGN, lexeme: '=', line: startLine, col: startCol });
            break;
          case '!':
            if (this.peek() === '=') { this.advance(); tokens.push({ type: TokenType.NE, lexeme: '!=', line: startLine, col: startCol }); }
            else throw new Error(`Lexer Error: Unexpected '!' at line ${startLine}, col ${startCol}`);
            break;
          case '<':
            if (this.peek() === '=') { this.advance(); tokens.push({ type: TokenType.LE, lexeme: '<=', line: startLine, col: startCol }); }
            else tokens.push({ type: TokenType.LT, lexeme: '<', line: startLine, col: startCol });
            break;
          case '>':
            if (this.peek() === '=') { this.advance(); tokens.push({ type: TokenType.GE, lexeme: '>=', line: startLine, col: startCol }); }
            else tokens.push({ type: TokenType.GT, lexeme: '>', line: startLine, col: startCol });
            break;
          default:
            throw new Error(`Lexer Error: Unexpected character '${char}' at line ${startLine}, col ${startCol}`);
        }
      }
    }
    tokens.push({ type: TokenType.EOF, lexeme: '', line: this.line, col: this.col });
    return tokens;
  }

  private isDigit(c: string) { return c >= '0' && c <= '9'; }
  private isAlpha(c: string) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }
  private isAlphaNumeric(c: string) { return this.isAlpha(c) || this.isDigit(c); }

  private keywordOrId(s: string): TokenType {
    switch (s) {
      case 'int': return TokenType.KW_INT;
      case 'if': return TokenType.KW_IF;
      case 'else': return TokenType.KW_ELSE;
      case 'while': return TokenType.KW_WHILE;
      case 'print': return TokenType.KW_PRINT;
      default: return TokenType.ID;
    }
  }
}
