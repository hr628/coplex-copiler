
import * as AST from './ast';
import { Token } from './types';

export class SemanticAnalyzer implements AST.ASTVisitor<void> {
  private scopes: Map<string, number>[] = [new Map()];
  private slotCounter = 0;
  public varToSlot = new Map<AST.ASTNode, number>();

  private currentScope() { return this.scopes[this.scopes.length - 1]; }

  private enterScope() { this.scopes.push(new Map()); }
  private exitScope() { this.scopes.pop(); }

  private resolve(name: string): number | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) return this.scopes[i].get(name);
    }
    return undefined;
  }

  visitProgram(node: AST.ProgramNode) {
    node.statements.forEach(s => s.accept(this));
  }

  visitVarDecl(node: AST.VarDeclNode) {
    const scope = this.currentScope();
    if (scope.has(node.name.lexeme)) {
      throw new Error(`Semantic Error: Redeclaration of '${node.name.lexeme}' at line ${node.name.line}`);
    }
    const slot = this.slotCounter++;
    scope.set(node.name.lexeme, slot);
    this.varToSlot.set(node, slot);
  }

  visitAssign(node: AST.AssignNode) {
    node.expr.accept(this);
    const slot = this.resolve(node.name.lexeme);
    if (slot === undefined) {
      throw new Error(`Semantic Error: Use of undeclared variable '${node.name.lexeme}' at line ${node.name.line}`);
    }
    this.varToSlot.set(node, slot);
  }

  visitPrint(node: AST.PrintNode) {
    node.expr.accept(this);
  }

  visitBlock(node: AST.BlockNode) {
    this.enterScope();
    node.statements.forEach(s => s.accept(this));
    this.exitScope();
  }

  visitIf(node: AST.IfNode) {
    node.cond.accept(this);
    node.thenBranch.accept(this);
    node.elseBranch?.accept(this);
  }

  visitWhile(node: AST.WhileNode) {
    node.cond.accept(this);
    node.body.accept(this);
  }

  visitBinaryExpr(node: AST.BinaryExprNode) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitLiteral(node: AST.LiteralNode) {}

  visitIdentifier(node: AST.IdentifierNode) {
    const slot = this.resolve(node.name.lexeme);
    if (slot === undefined) {
      throw new Error(`Semantic Error: Use of undeclared variable '${node.name.lexeme}' at line ${node.name.line}`);
    }
    this.varToSlot.set(node, slot);
  }
}
