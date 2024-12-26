import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { APIType, ListItem, ParamsType, ResultItem, Type } from "./common";
import {removeSync} from "fs-extra";

export function convertPathToName(url: string): string {
  const str = url.split('?')[0];
  const pascalCaseString = str.replaceAll('-', '').replaceAll('_', '')
    .split('/')
    .filter(Boolean)
    .flatMap(part => part.split('-'))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return pascalCaseString;
}

export async function clearDir(dir: string) {
  removeSync(dir);
}
export async function createFile(filePath: string, fileContents: string) {
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

export function generateAPIRules(list: ListItem[], includeReg: string[], excludeReg: string[]): APIType[] {
  let _list = [...list];
  if (includeReg.length) {
    _list = _list.filter(item => includeReg.some(reg => new RegExp(reg).test(item.path)));
  }
  if (excludeReg.length) {
    _list = _list.filter(item => !excludeReg.some(reg => new RegExp(reg).test(item.path)));
  }
  return _list.map(item => {
    const result: APIType = {
      title: item.title,
      method: item.method.toLowerCase(),
      path: item.path,
      key: convertPathToName(`/${item.method}${item.path}`),
      type: item.req_body_type?.toLowerCase() === Type.JSON ? Type.JSON : Type.FORM,
    } as APIType;
    const { req_body_other, res_body } = item;

    if (item.method.toLowerCase() === 'get') {
      const paramsList = [
        ...(item.req_headers?.filter((i) => i.name !== 'Content-Type') || []),
        ...(item.req_params || []),
        ...(item.req_query || []),
        ...(item.req_body_form || []),
      ];
      result.requestSchema = paramsList.length ? JSON.stringify(convertToJsonSchema(paramsList)) : '';
    } else if (hasProperty(req_body_other)) {
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
    method: item.method.toLowerCase(),
    title: item.title,
    path: item.path,
    req_body_type: item.req_body_type?.toLowerCase(),
    req_body_other: item.req_body_other,
    req_params: item.req_params,
    req_query: item.req_query,
    req_body_form: item.req_body_form,
    res_body_type: item.res_body_type?.toLowerCase(),
    res_body: item.res_body
  }})), []);
  return list;
}

export function replaceKey(key: string, lines: string[]) {
  const matchedNames: string[] = [];
  const _lines = lines.map(line => {
    if (line.toLowerCase().includes(key.toLowerCase())) {
      return line.replace(
        /^(export\s+interface\s+)(\w+)\b/gm,
        (match, prefix, typeName) => {
          return `${prefix}${key}`; // 防止 acronyms 关键词处理引发不一致问题
        }
      );
    }
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

export function convertToJsonSchema(reqBodyForm: ParamsType[]) {
  const schema: any = {
    type: "object",
    properties: {},
    required: []
  };

  reqBodyForm.forEach(field => {
    const { name, type, required, description, example, properties, items } = field;

    // Map YAPI field type to JSON Schema type
    const jsonSchemaType = mapToJsonSchemaType(type);

    if (jsonSchemaType === "object" && properties) {
      // 如果是嵌套对象，递归处理
      schema.properties[name] = {
        type: "object",
        properties: convertToJsonSchema(properties).properties,
        description: description || "",
        example: example || null
      };
    } else if (jsonSchemaType === "array" && items) {
      // 如果是数组，递归处理 items
      schema.properties[name] = {
        type: "array",
        items: convertToJsonSchema(items),
        description: description || "",
        example: example || null
      };
    } else {
      // 普通字段
      schema.properties[name] = {
        type: jsonSchemaType,
        description: description || "",
        example: example || null
      };
    }

    // Add to required fields if necessary
    if (Number(required) === 1) {
      schema.required.push(name);
    }
  });

  return schema;
}

export function mapToJsonSchemaType(type: string) {
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "string"; // 默认处理
  }
}