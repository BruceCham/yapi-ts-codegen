import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore
} from "quicktype-core";
import { APIType, FileInfo } from "./common";
import { replaceKey } from "./utils";
import { genAPITemplate } from "./template";

export async function generate(list: APIType[]): Promise<FileInfo[]> {
  const result = await Promise.all(list.map(generateApi));
  return result.filter(({ lines }) => !!lines);
}

export async function generateApi(request: APIType) {
  const { method, path, key, type, requestSchema, responseSchema } = request;
  const finalLines = [];
  if (requestSchema) {
    const { lines, error } = await quicktypeJSONSchemaSingle(`${key}Req`, requestSchema);
    if (error) {
      console.error(path, error);
    } else {
      finalLines.push(...replaceKey(`${key}Req`, lines));
    }
  }

  if (responseSchema) {
    const { lines, error } = await quicktypeJSONSchemaSingle(key, responseSchema);
    if (error) {
      console.error(path, error);
    } else {
      finalLines.push(...replaceKey(key, lines));
    }
  }

  finalLines.unshift(`import request from '@/api/request';`);
  const apiLine = genAPITemplate(method, path, type, key, !!requestSchema);
  finalLines.push(apiLine);

  const folder = path.split('/');
  const name = folder[folder.length - 1];
  const pathName = folder.slice(0, folder.length - 1).join('/');
  return {
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