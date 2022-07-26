import { topo } from '@semrel-extra/topo';
import path from 'path';
import readPackageJson from 'read-package-json-fast';
import fs from 'fs/promises';

type UpdateArgs = {
  command: string;
  name: string;
  cwd?: string;
  workspaces?: string[];
};

export async function update(args: UpdateArgs) {
  const { command, name } = args;

  if (!command) throw new TypeError('command is required argument');
  if (!name) throw new TypeError('name is required argument');

  const cwd = args.cwd ?? process.cwd();
  const workspaces = args.workspaces ?? (await getWorkspaces(cwd));

  const result = await topo({ workspaces, cwd });

  for (const packageName of result.queue.reverse()) {
    const packageData = result.packages[packageName];
    const wireit = {};

    for (const [dependencyName] of Object.entries(packageData.manifest.dependencies)) {
      const dependencyPackage = result.packages[dependencyName];
      const relative = path.posix.relative(
        packageData.absPath,
        dependencyPackage.absPath,
      );

      wireit[name] = {
        command,
        dependencies: [`${relative}:${name}`],
      };
    }

    if (Object.keys(wireit).length > 0) {
      packageData.manifest.wireit = wireit;
    }

    await fs.writeFile(
      packageData.manifestPath,
      JSON.stringify(packageData.manifest, null, 2),
    );
  }

  return result;
}

async function getWorkspaces(cwd: string) {
  const packageJson = await readPackageJson(path.resolve(cwd, 'package.json'));

  return packageJson.workspaces;
}
