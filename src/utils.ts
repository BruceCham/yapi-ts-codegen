import { mkdirSync, writeFileSync } from "fs";
import { extname, basename, dirname } from "path";
import { ListItem, ResultItem } from "./common";

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

export function parseYapi(result: ResultItem[] = []): ListItem[] {
  const list = result.reduce((acc: ListItem[], curr) => acc.concat(...curr.list.map(item => {return {
    method: item.method,
    title: item.title,
    path: item.path,
    req_body_type: item.req_body_type,
    req_body_other: item.req_body_other,
    res_body_type: item.res_body_type,
    res_body: item.res_body
  }})), []);
  return list;
}