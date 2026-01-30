
import * as AST from './ast';
import { OpCode, Instruction, TokenType } from './types';

export class CodeGenerator implements AST.ASTVisitor<void> {
  private instructions: Instruction[] = [];
  
  constructor(private varToSlot: Map<AST.ASTNode, number>) {}

  public getBytecode() {
    this.instructions.push({ op: OpCode.HALT });
    return this.instructions;
  }

  private emit(op: OpCode, operand?: number, comment?: string) {
    this.instructions.push({ op, operand, comment });
    return this.instructions.length - 1;
  }

  private patch(index: number, value: number) {
    this.instructions[index].operand = value;
  }

  visitProgram(node: AST.ProgramNode) {
    node.statements.forEach(s => s.accept(this));
  }

  visitVarDecl(node: AST.VarDeclNode) {
    // Variable space is reserved by index. No init code unless we want to default to 0.
    const slot = this.varToSlot.get(node);
    this.emit(OpCode.PUSH_INT, 0, `init ${node.name.lexeme}`);
    this.emit(OpCode.STORE, slot);
  }

  visitAssign(node: AST.AssignNode) {
    node.expr.accept(this);
    const slot = this.varToSlot.get(node);
    this.emit(OpCode.STORE, slot, `assign ${node.name.lexeme}`);
  }

  visitPrint(node: AST.PrintNode) {
    node.expr.accept(this);
    this.emit(OpCode.PRINT);
  }

  visitBlock(node: AST.BlockNode) {
    node.statements.forEach(s => s.accept(this));
  }

  visitIf(node: AST.IfNode) {
    node.cond.accept(this);
    const jumpIfFalseIdx = this.emit(OpCode.JMP_IF_FALSE, 0);
    node.thenBranch.accept(this);
    
    if (node.elseBranch) {
      const jumpToEndIdx = this.emit(OpCode.JMP, 0);
      this.patch(jumpIfFalseIdx, this.instructions.length);
      node.elseBranch.accept(this);
      this.patch(jumpToEndIdx, this.instructions.length);
    } else {
      this.patch(jumpIfFalseIdx, this.instructions.length);
    }
  }

  visitWhile(node: AST.WhileNode) {
    const loopStartIdx = this.instructions.length;
    node.cond.accept(this);
    const jumpIfFalseIdx = this.emit(OpCode.JMP_IF_FALSE, 0);
    node.body.accept(this);
    this.emit(OpCode.JMP, loopStartIdx);
    this.patch(jumpIfFalseIdx, this.instructions.length);
  }

  visitBinaryExpr(node: AST.BinaryExprNode) {
    node.left.accept(this);
    node.right.accept(this);
    switch (node.op.type) {
      case TokenType.PLUS: this.emit(OpCode.ADD); break;
      case TokenType.MINUS: this.emit(OpCode.SUB); break;
      case TokenType.STAR: this.emit(OpCode.MUL); break;
      case TokenType.SLASH: this.emit(OpCode.DIV); break;
      case TokenType.PERCENT: this.emit(OpCode.MOD); break;
      case TokenType.EQ: this.emit(OpCode.CMP_EQ); break;
      case TokenType.NE: this.emit(OpCode.CMP_NE); break;
      case TokenType.LT: this.emit(OpCode.CMP_LT); break;
      case TokenType.GT: this.emit(OpCode.CMP_GT); break;
      case TokenType.LE: this.emit(OpCode.CMP_LE); break;
      case TokenType.GE: this.emit(OpCode.CMP_GE); break;
    }
  }

  visitLiteral(node: AST.LiteralNode) {
    this.emit(OpCode.PUSH_INT, node.val);
  }

  visitIdentifier(node: AST.IdentifierNode) {
    const slot = this.varToSlot.get(node);
    this.emit(OpCode.LOAD, slot, `load ${node.name.lexeme}`);
  }
}
