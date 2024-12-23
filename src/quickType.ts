import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore
} from "quicktype-core";
import type { ListItem, QueryTypeSchemaInfo, QueryTypeSchemaResult } from "./common.d";
import { convertPathToName } from "./utils";

export async function quicktypeJSONSchema(list: ListItem[]): Promise<QueryTypeSchemaResult[]> {
  const result: QueryTypeSchemaInfo[] = [];
  list.forEach((item) => {
    const { path, req_body_other, res_body } = item;
    const prefixed = convertPathToName(path);

    result.push({
      name: `${prefixed}Req`,
      schema: req_body_other
    });

    result.push({
      name: `${prefixed}Res`,
      schema: res_body
    });
  })
  
  return await Promise.all(result.map(quicktypeJSONSchemaSingle));
}

export async function quicktypeJSONSchemaSingle(request: QueryTypeSchemaInfo) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
  const { name, schema } = request;
  await schemaInput.addSource({ name, schema });

  const inputData = new InputData();
  inputData.addInput(schemaInput);

  const { lines } = await quicktype({
      inputData,
      lang: 'ts',
  });
  return { name, lines: lines.join('\n') };
}
