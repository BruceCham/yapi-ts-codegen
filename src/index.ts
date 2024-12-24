import { join } from 'path';
import { download } from './download';

import { generate } from "./quickType";
import { createFile, removeSync, generateAPIRules, parseYapi } from './utils';
import { ConfigType } from './common';

export default async function main(config: ConfigType) {
  const { output, apiUrl, append, excludeReg = [], includeReg = [], clear } = config;
  const yapiRes = await download(apiUrl);
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);
    const apiRuleList = generateAPIRules(content, includeReg, excludeReg);

    const results = await generate(apiRuleList, append);
    const exportAll = new Set<string>();
    if (clear) {
      removeSync(output);
    }
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