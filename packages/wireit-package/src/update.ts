import { topo } from '@semrel-extra/topo';
import { promises as fs } from 'fs';
import path from 'path';
import readPackageJson from 'read-package-json-fast';

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
  const queue = [...result.queue].reverse();

  for (const packageName of queue) {
    const packageData = result.packages[packageName];

    if (!packageData?.manifest.dependencies) continue;

    const { manifest, absPath, manifestPath } = packageData;

    if (!manifest.dependencies) continue;

    const dependencies: string[] = [];

    manifest['scripts'] ??= {};
    manifest['scripts'][name] = 'wireit';

    manifest['wireit'] ??= {};
    manifest['wireit'][name] ??= {};
    manifest['wireit'][name].command = command;
    manifest['wireit'][name].dependencies = dependencies;

    for (const [dependencyName] of Object.entries(manifest.dependencies)) {
      const dependencyPackage = result.packages[dependencyName];

      if (!dependencyPackage) continue;

      const relative = path.posix.relative(absPath, dependencyPackage.absPath);

      dependencies.push(`${relative}:${name}`);
    }

    if (dependencies.length > 0) {
      await fs.writeFile(manifestPath, JSON.stringify(manifest, undefined, 2));
    }
  }

  return result;
}

async function getWorkspaces(cwd: string): Promise<string[]> {
  const packageJson = await readPackageJson(path.resolve(cwd, 'package.json'));

  return packageJson.workspaces;
}
