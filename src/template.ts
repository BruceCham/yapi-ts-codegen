export function genAPITemplate(method: string, path: string, type: string, key: string, hasRequest: boolean, hasResponse: boolean): string {
  const isGet = method.toUpperCase() === 'GET';
  const fnName = `api${key}`;
  const contentType = type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded';
  const req = hasRequest ? `${isGet ? 'params' : 'data'}: ${key}Req` : '';
  const params = isGet ? `params: ${hasRequest ? 'params' : '{}'},` : `data: ${hasRequest ? 'data' : '{}'},`;
  return (
`export async function ${fnName}(${req}): Promise<${hasResponse ? key : 'any'}> {
  return request({
    url: '${path}',
    method: '${method.toUpperCase()}',
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
    apiUrl: '',
    append: 'import request from "@/api/request";',
    output: 'src/api',
    clear: true,
    saveErrLog: true,
    includeReg: [],
    excludeReg: [],
  }
  return `module.exports = ${JSON.stringify(defaultConfigJSON, null, 2)}`
}