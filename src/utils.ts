import { mkdirSync, writeFileSync } from "fs";
import { extname, basename, dirname } from "path";
import { APIType, ListItem, ResultItem, Type } from "./common";

export function convertPathToName(url: string): string {
  const ext = extname(url); // 提取扩展名
  const baseName = basename(url, ext); // 提取文件名（无扩展名）
  const dirName = dirname(url); // 提取文件路径

  const pascalCaseString = dirName
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .flatMap(part => part.split('-'))
    .concat(baseName)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return pascalCaseString + ext; // 返回带扩展名的 PascalCase 字符串
}

export function createFile(filePath: string, fileContents: string) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, fileContents, "utf8");
}

function hasProperty(schema: any): boolean {
  if (!schema) return false;
  try {
    const obj = JSON.parse(schema);
    return !!Object.keys(obj.properties).length;
  } catch (err) {
    return false;
  }
}

export function generateAPIRules(list: ListItem[]): APIType[] {
  return list.map(item => {
    const result: APIType = {
      title: item.title,
      method: item.method.toUpperCase(),
      path: item.path,
      key: convertPathToName(item.path),
      type: item.req_body_type?.toLowerCase() === Type.JSON ? Type.JSON : Type.FORM,
    } as APIType;
    const { req_body_other, res_body } = item;

    if (hasProperty(req_body_other)) {
      result.requestSchema = req_body_other;
    }
    if (hasProperty(res_body)) {
      result.responseSchema = res_body;
    }
    return result;
  });
}

export function parseYapi(result: ResultItem[] = []): ListItem[] {
  const list = result.reduce((acc: ListItem[], curr) => acc.concat(...curr.list.map(item => {return {
    method: item.method.toUpperCase(),
    title: item.title,
    path: item.path,
    req_body_type: item.req_body_type?.toLowerCase(),
    req_body_other: item.req_body_other,
    res_body_type: item.res_body_type?.toLowerCase(),
    res_body: item.res_body
  }})), []);
  return list;
}

export function replaceKey(key: string, lines: string[]) {
  const matchedNames: string[] = [];
  const _lines = lines.map(line => {
    if (!line.includes(key)) {
      return line.replace(
        /^(export\s+interface\s+)(\w+)\b/gm,
        (match, prefix, typeName) => {
          matchedNames.push(typeName); // 保存原始类型名
          return `${prefix}${key}${typeName}`; // 替换类型名
        }
      );
    }
    return line;
  });
  return _lines.map(line => {
    return matchedNames.reduce((prev, curr) => {
      return prev.replace(new RegExp(`\\b${curr}\\b`, 'g'), `${key}${curr}`);
    }, line);
  });
}