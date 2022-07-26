import { cac } from 'cac';
import { update } from './index';

const cliName = 'wireit-package';
const cli = cac(cliName);

cli
  .command('update')
  .alias('u')
  .option('--name <name>', 'Wireit script name')
  .option('--command <command>', 'Command description')
  .example(`${cliName} update --name build --command "npm run build"`)
  .action(options => {
    update(options);
  });

cli.help();

cli.parse(process.argv, { run: true });
