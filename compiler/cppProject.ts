
export const cppFiles = {
  "CMakeLists.txt": `cmake_minimum_required(VERSION 3.10)
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
)`,
  "src/main.cpp": `#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include "lexer.h"
#include "parser.h"
#include "semantic.h"
#include "codegen.h"
#include "vm.h"

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: minicc <filename> [--tokens] [--ast] [--bytecode] [--run]\\n";
        return 1;
    }
    std::string filename = argv[1];
    std::ifstream file(filename);
    if (!file) {
        std::cerr << "Could not open file: " << filename << "\\n";
        return 1;
    }
    std::string source((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

    try {
        Lexer lexer(source);
        auto tokens = lexer.tokenize();
        
        Parser parser(tokens);
        auto ast = parser.parse();

        SemanticAnalyzer semantic;
        semantic.analyze(ast.get());

        CodeGenerator codegen(semantic.getVarToSlotMap());
        auto bytecode = codegen.generate(ast.get());

        VM vm(bytecode);
        vm.run();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\\n";
        return 1;
    }

    return 0;
}`,
  "src/lexer.h": `#pragma once
#include <string>
#include <vector>

enum class TokenType {
    KW_INT, KW_IF, KW_ELSE, KW_WHILE, KW_PRINT,
    ID, NUM, PLUS, MINUS, STAR, SLASH, PERCENT,
    ASSIGN, EQ, NE, LT, GT, LE, GE,
    LPAREN, RPAREN, LBRACE, RBRACE, SEMI, EOF_T
};

struct Token {
    TokenType type;
    std::string lexeme;
    int line;
    int col;
};

class Lexer {
public:
    Lexer(const std::string& input);
    std::vector<Token> tokenize();
private:
    std::string source;
    size_t pos = 0;
    int line = 1, col = 1;
};`
};
