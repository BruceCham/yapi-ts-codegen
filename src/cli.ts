import { Command } from 'commander';
import chalk from 'chalk';
import gen from './index';
import { ConfigDir, ConfigName } from './consts';
import { ConfigType } from './common';

const commander = new Command();

async function main() {
  commander
    .name(require('../package.json').name)
    .version(require('../package.json').version)
    .option(
      '--append [string]',
      '植入request函数，不填写时，只生成ts类型文件',
      undefined
    )
    .option('--init [boolean]', `在当前目录下创建配置文件，默认是 ${ConfigName}.js`, false)
    .parse(process.argv);

  const { init, append } = commander.opts();

  try {
    const loadedConfig: ConfigType = await require(ConfigDir);
    if (append) {
      loadedConfig.append = append;
    }
    gen(loadedConfig).then(() => {
      process.exit(0);
    }).catch(e => {
      console.log(chalk.red(e));
      process.exit(1);
    });
  } catch (e) {
    console.log(chalk.red(`[ERROR]: ${ConfigName}.js 文件未初始化配置`));
    process.exit(1);
  }
}

main();