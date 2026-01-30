
import { TokenType, Token } from './types';
import * as AST from './ast';

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  private peek() { return this.tokens[this.current]; }
  private previous() { return this.tokens[this.current - 1]; }
  private isAtEnd() { return this.peek().type === TokenType.EOF; }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new Error(`Parse Error: ${message} at '${token.lexeme}' (line ${token.line}, col ${token.col})`);
  }

  public parse(): AST.ProgramNode {
    const statements: AST.ASTNode[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }
    return new AST.ProgramNode(statements);
  }

  private statement(): AST.ASTNode {
    if (this.match(TokenType.KW_INT)) return this.varDecl();
    if (this.match(TokenType.KW_PRINT)) return this.printStmt();
    if (this.match(TokenType.KW_IF)) return this.ifStmt();
    if (this.match(TokenType.KW_WHILE)) return this.whileStmt();
    if (this.match(TokenType.LBRACE)) return this.block();
    return this.assignStmt();
  }

  private varDecl(): AST.ASTNode {
    const name = this.consume(TokenType.ID, "Expect variable name after 'int'");
    this.consume(TokenType.SEMI, "Expect ';' after variable declaration");
    return new AST.VarDeclNode(name);
  }

  private printStmt(): AST.ASTNode {
    this.consume(TokenType.LPAREN, "Expect '(' after 'print'");
    const expr = this.expression();
    this.consume(TokenType.RPAREN, "Expect ')' after print expression");
    this.consume(TokenType.SEMI, "Expect ';' after print statement");
    return new AST.PrintNode(expr);
  }

  private ifStmt(): AST.ASTNode {
    this.consume(TokenType.LPAREN, "Expect '(' after 'if'");
    const cond = this.expression();
    this.consume(TokenType.RPAREN, "Expect ')' after if condition");
    const thenBranch = this.statement();
    let elseBranch;
    if (this.match(TokenType.KW_ELSE)) {
      elseBranch = this.statement();
    }
    return new AST.IfNode(cond, thenBranch, elseBranch);
  }

  private whileStmt(): AST.ASTNode {
    this.consume(TokenType.LPAREN, "Expect '(' after 'while'");
    const cond = this.expression();
    this.consume(TokenType.RPAREN, "Expect ')' after while condition");
    const body = this.statement();
    return new AST.WhileNode(cond, body);
  }

  private block(): AST.ASTNode {
    const statements: AST.ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.statement());
    }
    this.consume(TokenType.RBRACE, "Expect '}' after block");
    return new AST.BlockNode(statements);
  }

  private assignStmt(): AST.ASTNode {
    const name = this.consume(TokenType.ID, "Expect identifier in assignment or statement");
    this.consume(TokenType.ASSIGN, "Expect '=' after identifier");
    const expr = this.expression();
    this.consume(TokenType.SEMI, "Expect ';' after assignment");
    return new AST.AssignNode(name, expr);
  }

  private expression(): AST.ASTNode {
    return this.comparison();
  }

  private comparison(): AST.ASTNode {
    let expr = this.term();
    while (this.match(TokenType.EQ, TokenType.NE, TokenType.LT, TokenType.GT, TokenType.LE, TokenType.GE)) {
      const op = this.previous();
      const right = this.term();
      expr = new AST.BinaryExprNode(expr, op, right);
    }
    return expr;
  }

  private term(): AST.ASTNode {
    let expr = this.factor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const op = this.previous();
      const right = this.factor();
      expr = new AST.BinaryExprNode(expr, op, right);
    }
    return expr;
  }

  private factor(): AST.ASTNode {
    let expr = this.primary();
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const op = this.previous();
      const right = this.primary();
      expr = new AST.BinaryExprNode(expr, op, right);
    }
    return expr;
  }

  private primary(): AST.ASTNode {
    if (this.match(TokenType.NUM)) return new AST.LiteralNode(Number(this.previous().lexeme));
    if (this.match(TokenType.ID)) return new AST.IdentifierNode(this.previous());
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expect ')' after expression");
      return expr;
    }
    throw new Error(`Parse Error: Expect expression at '${this.peek().lexeme}'`);
  }
}
