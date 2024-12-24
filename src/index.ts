import { join } from 'path';
import { download } from './download';

import { generate } from "./quickType";
import { createFile, generateAPIRules, parseYapi } from './utils';

const OUTPUT_DIR = "./dist";

/**
 * todo list
 * 1. 接口前缀过滤
 * 2. float double 转 number
 * 3. 生成请求过程
 * 4. form-data 处理
 * 5. 错误日志记录
 *  */ 
async function main() {
  // const yapiRes = await require('../yapi.json');
  const yapiRes = await download('https://yapi.zuoyebang.cc/api/open/plugin/export-full?type=json&pid=776&status=all&token=9b0dd87aae70d4febec746dec86679b965185fd56c4377e8f48bf2cacbca2db3');
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);
    const apiRuleList = generateAPIRules(content);

    const results = await generate(apiRuleList);
    const exportAll = [];
    for (const { name, path , lines } of results) {
      exportAll.push(`export * from '.${path}/${name}';`);
      const outputPath = join(OUTPUT_DIR, path, `${name}.ts`);
      createFile(outputPath, lines);
    }
    createFile(join(OUTPUT_DIR, 'index.ts'), exportAll.join('\n'));
  }
}

main();