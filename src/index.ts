import parse from "./parser";
import { readFileSync } from "fs";
import { printParserOutput } from "./util/parser";
import transpile from "./transpiler";

let src = readFileSync("فحص.اللغة", "utf8");

const parser = parse(src);

printParserOutput(parser, src);

const js = transpile(parser.tokens, src);

const compiledJs = js.src.join(";");

console.log("\n## GENERATED JS CODE\n");

console.log(compiledJs);

console.log("\n## RUNNING JS.....\n");

eval(compiledJs);
