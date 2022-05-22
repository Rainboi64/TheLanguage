import parse from "./parser";
import { readFileSync } from 'fs';
import { printParserOutput } from "./util/parser";

let src = readFileSync('فحص.اللغة','utf8');
printParserOutput(parse(src), src);