import { IField } from './interface';
import { parse } from '@babel/parser';
import {
  isTSInterfaceDeclaration,
  TSInterfaceDeclaration,
  isTSPropertySignature,
  isTSMethodSignature,
  isIdentifier
} from '@babel/types';
import * as fs from 'fs';
import generate from '@babel/generator';
import { parserComment, mergeFieldMeta } from './comment';

export function readInterfaceAstByName(
  filePath: string,
  name: string
): TSInterfaceDeclaration | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const ast = parse(fs.readFileSync(filePath).toString(), {
    plugins: ['typescript']
  });
  for (let node of ast.program.body) {
    if (isTSInterfaceDeclaration(node) && node.id.name === name) {
      return node;
    }
  }
  return null;
}

export function parserTsInterfaceDeclaration(
  targetInterface: TSInterfaceDeclaration
): IField[] {
  const result = targetInterface.body.body.map(node => {
    if (!(isTSPropertySignature(node) || isTSMethodSignature(node))) {
      return null;
    }
    const { optional, key, typeAnnotation, leadingComments } = node;
    if (!isIdentifier(key)) {
      return null;
    }

    let meta;
    if (Array.isArray(leadingComments) && leadingComments.length > 0) {
      meta = mergeFieldMeta(leadingComments.map(o => parserComment(o.value)));
    }
    return {
      optional: !!optional,
      name: key.name,
      types: (generate(typeAnnotation).code as string).slice(2),
      meta
    };
  });
  return result.filter(o => !!o);
}
