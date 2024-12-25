import { AppendRequest } from "./consts";

export function genAPITemplate(method: string, path: string, type: string, key: string, hasRequest: boolean, hasResponse: boolean): string {
  const isGet = method.toUpperCase() === 'GET';
  const isForm = type !== 'json';
  const fnName = `api${key}`;
  const contentType = isForm ? "application/x-www-form-urlencoded;charset=UTF-8" : "application/json";
  const req = hasRequest ? `data: ${key}Req` : '';
  const params = `${isGet ? 'params' : 'data'}: ${hasRequest ? isForm ? 'qs.stringify(data)' : 'data' : '{}'},`;

  return (
`export async function ${fnName}(${req}): Promise<${hasResponse ? key : 'any'}> {
  return request({
    url: "${path}",
    method: "${method.toUpperCase()}",
    headers: {
      "content-type": '${contentType}',
    },
    ${params}
  });
}`
  );
}

export function getConfigFile() {
  const defaultConfigJSON = {
    apiUrl: "",
    append: AppendRequest,
    output: "src/api",
    clear: true,
    saveErrLog: true,
    includeReg: [],
    excludeReg: [],
  }
  return `module.exports = ${JSON.stringify(defaultConfigJSON, null, 2)}`
}