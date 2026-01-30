
import { OpCode, Instruction } from './types';

export class VM {
  private stack: number[] = [];
  private variables: number[] = [];
  private ip = 0;
  private output: string[] = [];

  constructor(private bytecode: Instruction[]) {}

  public run(): string[] {
    this.output = [];
    this.ip = 0;
    this.stack = [];
    
    let iterations = 0;
    const MAX_ITERATIONS = 100000; // Safety limit

    while (this.ip < this.bytecode.length && iterations < MAX_ITERATIONS) {
      iterations++;
      const inst = this.bytecode[this.ip];
      
      switch (inst.op) {
        case OpCode.PUSH_INT:
          this.stack.push(inst.operand!);
          this.ip++;
          break;
        case OpCode.LOAD:
          this.stack.push(this.variables[inst.operand!] ?? 0);
          this.ip++;
          break;
        case OpCode.STORE:
          this.variables[inst.operand!] = this.stack.pop()!;
          this.ip++;
          break;
        case OpCode.ADD: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a + b);
          this.ip++;
          break;
        }
        case OpCode.SUB: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a - b);
          this.ip++;
          break;
        }
        case OpCode.MUL: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a * b);
          this.ip++;
          break;
        }
        case OpCode.DIV: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(Math.floor(a / b));
          this.ip++;
          break;
        }
        case OpCode.MOD: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a % b);
          this.ip++;
          break;
        }
        case OpCode.CMP_EQ: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a === b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.CMP_NE: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a !== b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.CMP_LT: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a < b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.CMP_GT: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a > b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.CMP_LE: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a <= b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.CMP_GE: {
          const b = this.stack.pop()!;
          const a = this.stack.pop()!;
          this.stack.push(a >= b ? 1 : 0);
          this.ip++;
          break;
        }
        case OpCode.JMP:
          this.ip = inst.operand!;
          break;
        case OpCode.JMP_IF_FALSE:
          if (this.stack.pop() === 0) {
            this.ip = inst.operand!;
          } else {
            this.ip++;
          }
          break;
        case OpCode.PRINT:
          this.output.push(String(this.stack.pop()));
          this.ip++;
          break;
        case OpCode.HALT:
          return this.output;
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      this.output.push("Runtime Error: Exceeded execution limit (possible infinite loop)");
    }

    return this.output;
  }
}
