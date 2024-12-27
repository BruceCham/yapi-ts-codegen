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
  return _list.map(api => {
    const result: APIType = {
      title: api.title,
      method: api.method.toLowerCase(),
      path: api.path,
      key: convertPathToName(`/${api.method}${api.path}`),
      type: api.req_body_type?.toLowerCase() === Type.JSON ? Type.JSON : Type.FORM,
    } as APIType;

    const paramsList = [
      ...(api.req_headers?.filter((i) => i.name !== 'Content-Type') || []),
      ...(api.req_params || []),
      ...(api.req_query || []),
    ];

    let originSchema = null;
    if (api.method.toLowerCase() !== 'get') {
      switch (api.req_body_type) {
        case 'form' : {
          api.req_body_form?.length && paramsList.push(...api.req_body_form);
          break;
        }
        case 'json': 
        case 'raw': {
          if (hasProperty(api.req_body_other)) {
            originSchema = JSON.parse(api.req_body_other);
          }
          break;
        }
      }
    }
    result.requestSchema = paramsList.length ? JSON.stringify(convertToJsonSchema(paramsList, originSchema)) : (originSchema ? api.req_body_other : '');

    let body = api.res_body;
    if (api.res_body_is_json_schema && api.res_schema_body) {
      body = api.res_schema_body;
    }
    if (hasProperty(body)) {
      result.responseSchema = body;
    }
    return result;
  });
}

export function parseYapi(result: ResultItem[] = []): ListItem[] {
  const list = result.reduce((acc: ListItem[], curr) => acc.concat(...curr.list.map(api => {return {
    method: api.method.toLowerCase(),
    title: api.title,
    path: api.path,
    req_body_type: api.req_body_type?.toLowerCase(),
    req_body_is_json_schema: api.req_body_is_json_schema,
    req_body_other: api.req_body_other,
    req_params: api.req_params,
    req_query: api.req_query,
    req_headers: api.req_headers,
    req_body_form: api.req_body_form,
    res_body_is_json_schema: api.res_body_is_json_schema,
    res_body_type: api.res_body_type?.toLowerCase(),
    res_body: api.res_body,
    res_schema_body: api.res_schema_body,
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
          if (typeName.toLowerCase() === key.toLowerCase()) {
            return `${prefix}${key}`; // 防止 acronyms 关键词处理引发不一致问题
          }
          return `${prefix}${typeName}`; // 防止 acronyms 关键词处理引发不一致问题
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

export function convertToJsonSchema(reqBodyForm: ParamsType[], originSchema?: any) {
  const schema: any = originSchema || {
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