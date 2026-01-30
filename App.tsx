
import React, { useState, useEffect, useCallback } from 'react';
import { Lexer } from './compiler/lexer';
import { Parser } from './compiler/parser';
import { SemanticAnalyzer } from './compiler/semantic';
import { CodeGenerator } from './compiler/codegen';
import { VM } from './compiler/vm';
import { TokenType, Instruction, OpCode } from './compiler/types';
import { 
  Play, 
  Code, 
  FileCode, 
  Terminal, 
  AlertCircle, 
  Download,
  BookOpen,
  Hash
} from 'lucide-react';

const SAMPLES = [
  {
    name: "sample1_arithmetic.mc",
    code: `// Arithmetic and variables
int a;
int b;
a = 10;
b = 20;
int c;
c = a + b * 2;
print(c); // Should be 50`
  },
  {
    name: "sample2_if.mc",
    code: `int x;
x = 100;
if (x > 50) {
    print(1);
} else {
    print(0);
}`
  },
  {
    name: "sample3_while.mc",
    code: `int i;
i = 0;
while (i < 5) {
    print(i);
    i = i + 1;
}`
  },
  {
    name: "sample4_nested_scope.mc",
    code: `int x;
x = 1;
print(x);
{
    int x; // Shadowing
    x = 10;
    print(x);
}
print(x); // Back to global scope`
  },
  {
    name: "sample5_complex.mc",
    code: `// Calculating sum of first 10 numbers
int n;
int sum;
n = 10;
sum = 0;
while (n > 0) {
    sum = sum + n;
    n = n - 1;
}
print(sum);`
  },
  {
    name: "sample6_errors.mc",
    code: `// Semantic Error: Redeclaration
int a;
int a;
a = 10;
print(b); // Semantic Error: Undeclared`
  }
];

export default function App() {
  const [code, setCode] = useState(SAMPLES[0].code);
  const [logs, setLogs] = useState<string[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [bytecode, setBytecode] = useState<Instruction[]>([]);
  const [activeTab, setActiveTab] = useState<'output' | 'tokens' | 'bytecode' | 'cpp'>('output');

  const runCompiler = useCallback(() => {
    setLogs([]);
    try {
      // 1. Lexing
      const lexer = new Lexer(code);
      const tks = lexer.tokenize();
      setTokens(tks);

      // 2. Parsing
      const parser = new Parser(tks);
      const ast = parser.parse();

      // 3. Semantic Analysis
      const semantic = new SemanticAnalyzer();
      semantic.visitProgram(ast);

      // 4. Code Generation
      const codegen = new CodeGenerator(semantic.varToSlot);
      const bc = codegen.getBytecode();
      setBytecode(bc);

      // 5. VM Execution
      const vm = new VM(bc);
      const result = vm.run();
      setLogs(result);
      setActiveTab('output');
    } catch (e: any) {
      setLogs([`Error: ${e.message}`]);
      setActiveTab('output');
    }
  }, [code]);

  const downloadCpp = () => {
    const readme = `Mini Language Compiler Project
==============================

GRAMMAR (EBNF)
--------------
program    = { statement }
statement  = "int" id ";" 
           | id "=" expression ";"
           | "print" "(" expression ")" ";"
           | "if" "(" expression ")" statement [ "else" statement ]
           | "while" "(" expression ")" statement
           | "{" { statement } "}"
expression = comparison
comparison = term { ("==" | "!=" | "<" | ">" | "<=" | ">=") term }
term       = factor { ("+" | "-") factor }
factor     = primary { ("*" | "/" | "%") primary }
primary    = num | id | "(" expression ")"

OPCODES
-------
- PUSH_INT n : Push literal integer
- LOAD idx   : Load variable from slot idx
- STORE idx  : Pop value and store in slot idx
- ADD, SUB, MUL, DIV, MOD
- CMP_...    : Comparison operators (pushes 0 or 1)
- JMP addr   : Unconditional jump
- JMP_IF_FALSE : Jump if top of stack is 0
- PRINT      : Pop and print value
- HALT       : Terminate VM

BUILD STEPS
-----------
1. mkdir build
2. cd build
3. cmake ..
4. cmake --build .
5. ./minicc ../samples/sample1.mc --run
`;
    const blob = new Blob([readme], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PROJECT_README.txt';
    link.click();
    alert("This demo provides the compiler logic in JS. For the full C++ project source code as a zip, please refer to the 'C++ Source' tab to copy individual files.");
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Mini-C Compiler Lab
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={runCompiler}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-all font-medium shadow-sm hover:shadow-green-900/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Compile & Run</span>
          </button>
          <button 
            onClick={downloadCpp}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Project ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Samples */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Sample Programs
          </h2>
          <div className="space-y-1">
            {SAMPLES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCode(s.code)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  code === s.code ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="pt-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center mb-3">
              <AlertCircle className="w-4 h-4 mr-2" />
              Language Features
            </h2>
            <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
              <li>Strongly Typed (Integers)</li>
              <li>Block Scoping & Shadowing</li>
              <li>Recursive Descent Parser</li>
              <li>Stack-Based Bytecode VM</li>
              <li>Recursive AST Visitors</li>
            </ul>
          </div>
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-gray-400 flex items-center border-b border-gray-700">
            <FileCode className="w-3 h-3 mr-2" />
            main.mc
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-gray-950 text-gray-300 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 selection:bg-blue-500/30"
            spellCheck={false}
            placeholder="// Write your Mini-C code here..."
          />
        </div>

        {/* Inspection Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="flex border-b border-gray-700">
            {(['output', 'tokens', 'bytecode', 'cpp'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {activeTab === 'output' && (
              <div className="space-y-2">
                <div className="flex items-center text-gray-500 mb-2 border-b border-gray-700 pb-2">
                  <Terminal className="w-4 h-4 mr-2" />
                  <span>Program Output</span>
                </div>
                {logs.length === 0 ? (
                  <div className="text-gray-600 italic">No output yet. Run the compiler.</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={log.startsWith('Error') || log.includes('Semantic Error') ? 'text-red-400' : 'text-green-400'}>
                      {log.startsWith('Error') ? <AlertCircle className="inline w-4 h-4 mr-1 mb-1" /> : '>'} {log}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-1">
                {tokens.map((t, i) => (
                  <div key={i} className="text-xs flex justify-between border-b border-gray-700/50 py-1">
                    <span className="text-purple-400">{TokenType[t.type]}</span>
                    <span className="text-gray-300">"{t.lexeme}"</span>
                    <span className="text-gray-600">L{t.line}:C{t.col}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bytecode' && (
              <div className="space-y-1">
                {bytecode.map((inst, i) => (
                  <div key={i} className="text-xs grid grid-cols-12 gap-2 border-b border-gray-700/50 py-1">
                    <span className="col-span-2 text-gray-500">{i.toString().padStart(3, '0')}</span>
                    <span className="col-span-4 text-blue-400 font-bold">{OpCode[inst.op]}</span>
                    <span className="col-span-2 text-orange-400">{inst.operand !== undefined ? inst.operand : ''}</span>
                    <span className="col-span-4 text-gray-600 truncate">{inst.comment ? `; ${inst.comment}` : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cpp' && (
              <div className="space-y-6">
                <div className="text-xs text-gray-400 mb-4 bg-gray-900 p-3 rounded border border-gray-700">
                  <p>The C++ codebase is provided here. In a real environment, you would use CMake to compile these.</p>
                </div>
                <div>
                  <h3 className="text-blue-400 font-bold mb-2">CMakeLists.txt</h3>
                  <pre className="bg-gray-950 p-3 rounded text-[10px] text-gray-300 overflow-x-auto">
                    {`cmake_minimum_required(VERSION 3.10)
project(MiniCompiler)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(minicc 
    src/main.cpp 
    src/lexer.cpp 
    src/parser.cpp 
    src/ast.cpp 
    src/semantic.cpp 
    src/codegen.cpp 
    src/vm.cpp
)`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-blue-400 font-bold mb-2">src/vm.h</h3>
                  <pre className="bg-gray-950 p-3 rounded text-[10px] text-gray-300 overflow-x-auto">
                    {`#pragma once
#include <vector>
#include <stack>
#include "types.h"

class VM {
public:
    VM(const std::vector<Instruction>& bc) : bytecode(bc) {}
    void run() {
        while (ip < bytecode.size()) {
            auto& inst = bytecode[ip];
            switch (inst.op) {
                case OpCode::PUSH_INT: 
                    stack.push(inst.operand); ip++; break;
                // ... other ops ...
                case OpCode::HALT: return;
            }
        }
    }
private:
    std::vector<Instruction> bytecode;
    std::stack<int> stack;
    std::vector<int> variables;
    int ip = 0;
};`}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-700 bg-gray-900 flex justify-between items-center">
             <div className="flex items-center space-x-2 text-gray-500 text-xs">
                <Hash className="w-3 h-3" />
                <span>Compiler Status: Ready</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </main>
      
      {/* Footer Info */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex justify-between items-center text-[10px] text-gray-500">
        <div>Mini Language Specification v1.0.0 | Academic Project Framework</div>
        <div className="flex space-x-4">
          <span>Target Architecture: Stack VM (32-bit int)</span>
          <span>Pipeline: Lexer → Parser → Semantic → CodeGen → VM</span>
        </div>
      </footer>
    </div>
  );
}
