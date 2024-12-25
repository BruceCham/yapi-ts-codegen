import { Command } from 'commander';
import chalk from 'chalk';
import gen from './index';
import { ConfigDir, ConfigName } from './consts';
import { ConfigType } from './common';
import { getConfigFile } from './template';
import { createFile } from './utils';

const commander = new Command();

async function main() {
  commander
    .name(require('../package.json').name)
    .version(require('../package.json').version)
    .option(
      '--append [string]',
      'append to the generated file, default is "import request from "@/api/request";", you can use --append "" to remove it',
      undefined
    )
    .option('--clear [boolean]', 'should the previously generated file be cleared? default false', false)
    .option('--init [boolean]', `create config file in root, ${ConfigName}.js`, false)
    .parse(process.argv);

  const { init, append, clear, saveErrLog } = commander.opts();
  if (init) {
    await createFile(ConfigDir, getConfigFile());
    console.log(chalk.green(`[Success] config file save to ${ConfigDir}`));
    process.exit(0);
  }

  try {
    const loadedConfig: ConfigType = await require(ConfigDir);
    if (append) {
      loadedConfig.append = append;
    }
    if (clear) {
      loadedConfig.clear = clear;
    }
    if (saveErrLog) {
      loadedConfig.saveErrLog = saveErrLog;
    }
    gen(loadedConfig).then(() => {
      process.exit(0);
    }).catch(e => {
      console.log(chalk.red(e));
      process.exit(1);
    });
  } catch (e) {
    console.log(chalk.red(`[ERROR]: ${ConfigName}.js config file not found`));
    process.exit(1);
  }
}

main();