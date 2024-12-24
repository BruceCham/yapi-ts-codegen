import { join } from 'path';
import { download } from './download';

import { generate } from "./quickType";
import { createFile, generateAPIRules, parseYapi } from './utils';

const OUTPUT_DIR = "./dist";

async function main() {
  const yapiRes = await require('../yapi.json');
  // const yapiRes = await download('https://yapi.zuoyebang.cc/api/open/plugin/export-full?type=json&pid=776&status=all&token=9b0dd87aae70d4febec746dec86679b965185fd56c4377e8f48bf2cacbca2db3');
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);
    const apiRuleList = generateAPIRules(content);

    const results = await generate(apiRuleList);

    for (const { name, path , lines } of results) {
      const outputPath = join(OUTPUT_DIR, path, `${name}.ts`);
      createFile(outputPath, lines);
    }
  }
}

main();