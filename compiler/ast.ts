
import { Token } from './types';

export abstract class ASTNode {
  abstract accept<T>(visitor: ASTVisitor<T>): T;
}

export class ProgramNode extends ASTNode {
  constructor(public statements: ASTNode[]) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitProgram(this); }
}

export class VarDeclNode extends ASTNode {
  constructor(public name: Token) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitVarDecl(this); }
}

export class AssignNode extends ASTNode {
  constructor(public name: Token, public expr: ASTNode) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitAssign(this); }
}

export class PrintNode extends ASTNode {
  constructor(public expr: ASTNode) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitPrint(this); }
}

export class BlockNode extends ASTNode {
  constructor(public statements: ASTNode[]) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitBlock(this); }
}

export class IfNode extends ASTNode {
  constructor(public cond: ASTNode, public thenBranch: ASTNode, public elseBranch?: ASTNode) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitIf(this); }
}

export class WhileNode extends ASTNode {
  constructor(public cond: ASTNode, public body: ASTNode) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitWhile(this); }
}

export class BinaryExprNode extends ASTNode {
  constructor(public left: ASTNode, public op: Token, public right: ASTNode) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitBinaryExpr(this); }
}

export class LiteralNode extends ASTNode {
  constructor(public val: number) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitLiteral(this); }
}

export class IdentifierNode extends ASTNode {
  constructor(public name: Token) { super(); }
  accept<T>(visitor: ASTVisitor<T>): T { return visitor.visitIdentifier(this); }
}

export interface ASTVisitor<T> {
  visitProgram(node: ProgramNode): T;
  visitVarDecl(node: VarDeclNode): T;
  visitAssign(node: AssignNode): T;
  visitPrint(node: PrintNode): T;
  visitBlock(node: BlockNode): T;
  visitIf(node: IfNode): T;
  visitWhile(node: WhileNode): T;
  visitBinaryExpr(node: BinaryExprNode): T;
  visitLiteral(node: LiteralNode): T;
  visitIdentifier(node: IdentifierNode): T;
}
