export function genAPITemplate(method: string, path: string, type: string, key: string, hasParams: boolean): string {
  const isGet = method === 'GET';
  const fnName = isGet ? `get${key}` : `post${key}`;
  const contentType = type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded';
  const req = hasParams ? `${isGet ? 'params' : 'data'}: ${key}Req` : '';
  const params = isGet ? `params: ${hasParams ? 'params': '{}'},` : `data: ${hasParams ? 'data' : '{}'},`;
  return (
`export async function ${fnName}(${req}): Promise<${key}> {
  return request({
    url: '${path}',
    method: '${method}',
    headers: {
      "content-type": '${contentType}',
    },
    ${params}
  });
};`
  );
}