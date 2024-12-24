import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore
} from "quicktype-core";
import type { ListItem, QueryTypeSchemaResult } from "./common.d";

// todo float 转 number
export async function quicktypeJSONSchema(list: ListItem[]): Promise<QueryTypeSchemaResult[]> {
  const result = await Promise.all(list.map(quicktypeJSONSchemaSingle));
  return result.filter(({ lines }) => !!lines);
}

export async function quicktypeJSONSchemaSingle(request: ListItem) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
  const { path, req_body_other, res_body } = request;

  try {
    if (req_body_other) {
      const shema = JSON.parse(req_body_other);
      const hasProperty = !!Object.keys(shema.properties).length;
      hasProperty && await schemaInput.addSource({ name: 'IRequest', schema: req_body_other });
    }
  } catch (err) {}

  try {
    if (res_body) {
      const shema = JSON.parse(res_body);
      const hasProperty = !!Object.keys(shema.properties).length;
      hasProperty && await schemaInput.addSource({ name: 'IResponse', schema: res_body });
    }
  } catch (err) {}

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
    const folder = path.split('/');
    const name = folder[folder.length - 1];
    const pathName = folder.slice(0, folder.length - 1).join('/');
    return { name, path: pathName, lines: lines.join('\n') };
  } catch (err) {
    console.error(path, err);
    console.error(req_body_other, res_body);
    return { name: '', path, lines: '' };
  }
}
