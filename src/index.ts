import { join } from 'path';
import { download } from './download';

import { generate } from "./quickType";
import { createFile, generateAPIRules, parseYapi } from './utils';
import { ConfigType } from './common';

/**
 * todo list
 * 1. 接口前缀过滤
 * 2. float double 转 number
 * 3. 生成请求过程
 * 4. form-data 处理
 * 5. 错误日志记录
 *  */ 
export default async function main(config: ConfigType) {
  const { output, apiUrl, append, excludeReg = [], includeReg = [] } = config;
  const yapiRes = await download(apiUrl);
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);
    const apiRuleList = generateAPIRules(content, includeReg, excludeReg);

    const results = await generate(apiRuleList, append);
    const exportAll = new Set<string>();
    for (const { name, path , lines, method } of results) {
      exportAll.add(`export * from '.${path}/${name}-${method.toLowerCase()}';`);
      const outputPath = join(config.output, path, `${name}-${method.toLowerCase()}.ts`);
      await createFile(outputPath, lines);
    }
    await createFile(join(output, 'index.ts'), [...exportAll].join('\n'));
    return 0;
  }
  return 1;
}