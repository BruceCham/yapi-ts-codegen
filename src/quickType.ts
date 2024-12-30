import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore
} from "quicktype-core";
import { APIType, FileInfo } from "./common";
import { replaceKey } from "./utils";
import { genAPITemplate } from "./template";
import { AppendQS } from "./consts";

export async function generate(list: APIType[], append: string): Promise<FileInfo[]> {
  return await Promise.all(list.map((item) => generateApi(item, append)));
}

export async function generateApi(request: APIType, append: string): Promise<FileInfo> {
  const { method, path, key, type, requestSchema, responseSchema } = request;
  const finalLines = [];
  if (requestSchema) {
    const { lines, error } = await quicktypeJSONSchemaSingle(`${key}Req`, requestSchema);
    if (error) {
      return { method, path, name: key, lines: '', error };
    } else {
      finalLines.push(...replaceKey(`${key}Req`, lines));
    }
  }

  if (responseSchema) {
    const { lines, error } = await quicktypeJSONSchemaSingle(key, responseSchema);
    if (error) {
      return { method, path, name: key, lines: '', error };
    } else {
      finalLines.push(...replaceKey(key, lines));
    }
  }

  if (append) {
    type !== 'json' && requestSchema && method === 'post' && finalLines.unshift(AppendQS);
    finalLines.unshift(append);
    const apiLine = genAPITemplate(method, path, type, key, !!requestSchema, !!responseSchema);
    finalLines.push(apiLine);
  }

  const folder = path.split('/');
  const name = folder[folder.length - 1];
  const pathName = folder.slice(0, folder.length - 1).join('/');
  return {
    method,
    path: pathName,
    name,
    lines: finalLines.join('\n')
  };
}

export async function quicktypeJSONSchemaSingle(name: string, schema: string) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
  await schemaInput.addSource({ name, schema });
  const inputData = new InputData();
  inputData.addInput(schemaInput);
  try {
    const { lines } = await quicktype({
      inputData,
      lang: 'ts',
      rendererOptions: {
        'just-types': true,
        'runtime-typecheck': false
      },
    });
    return { lines: lines, error: null };
  } catch (err) {
    return { lines: [], error: err };
  }
}