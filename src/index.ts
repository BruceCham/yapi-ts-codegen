import { join } from 'path';
import chalk from 'chalk';
import { download } from './download';
import { generate } from "./quickType";
import { createFile, generateAPIRules, parseYapi, clearDir } from './utils';
import { ConfigType } from './common';
import { ProjectDir } from './consts';

export default async function main(config: ConfigType) {
  const { output, apiUrl, append, excludeReg = [], includeReg = [], clear, saveErrLog } = config;
  const yapiRes = await download(apiUrl);
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);
    const apiRuleList = generateAPIRules(content, includeReg, excludeReg);

    const results = await generate(apiRuleList, append);
    const fileInfoList = results.filter(({lines}) => !!lines);
    const errorList = results.filter(({lines}) => !lines);
    const errorLines = errorList.map(({method, path, error}) => `${method} ${path} \n${error}`);

    if (errorLines.length) {
      const error = errorLines.join('\n');
      console.log(chalk.red(`[ERROR]: ${error}`));
      if (saveErrLog) {
        await createFile(join(ProjectDir, `yts.error.log`), errorLines.join('\n'));
      }
    }

    const exportAll = new Set<string>();
    if (clear) {
      await clearDir(output);
    }
    for (const { name, path , lines, method } of fileInfoList) {
      exportAll.add(`export * from '.${path}/${name}-${method.toLowerCase()}';`);
      const outputPath = join(config.output, path, `${name}-${method.toLowerCase()}.ts`);
      await createFile(outputPath, lines);
    }
    await createFile(join(output, 'index.ts'), [...exportAll].sort((a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })).join('\n'));
    return 0;
  }
  return 1;
}