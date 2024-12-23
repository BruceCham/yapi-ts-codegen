import { mkdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { download, parseYapi } from './download';

import { quicktypeJSONSchema } from "./quickType";
import { createFile } from './utils';

const OUTPUT_DIR = "./dist";

async function main() {
  const yapiRes = await download('../yapi.json');
  if (yapiRes.code === 0) {
    const content = parseYapi(yapiRes.result);

    const results = await quicktypeJSONSchema(content);

    for (const { name, lines } of results) {
      const outputPath = path.join(OUTPUT_DIR, `${name}.ts`);
      createFile(outputPath, lines);
    }
  }
}

main();