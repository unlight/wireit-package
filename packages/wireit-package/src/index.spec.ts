import { topo } from '@semrel-extra/topo';
import expect from 'expect';
import fs from 'fs';
import mockFs from 'mock-fs';
import path from 'path';

import { update } from './index';

describe('playground', () => {
  before(() => {
    const volume = {
      '/root/package.json': JSON.stringify({
        workspaces: ['apps/*', 'packages/*'],
      }),
      '/root/packages/a/package.json': JSON.stringify({ name: 'a' }),
      '/root/packages/b/package.json': JSON.stringify({ name: 'b' }),
      '/root/packages/c/package.json': JSON.stringify({
        name: 'c',
        dependencies: { a: '*', b: '*' },
      }),
      '/root/apps/app1/package.json': JSON.stringify({
        name: 'app1',
        dependencies: { b: '*' },
      }),
    };
    mockFs(volume);
  });

  after(() => {
    mockFs.restore();
  });

  it.skip('test read', () => {
    const read = fs.readFileSync('/root/package.json');
    console.log('read', read);
  });

  it.skip('resolved path', () => {
    const resolved = path.resolve('/root/package.json');
    console.log('resolved', resolved);
  });

  it.skip('graph', async () => {
    const graph = await topo({
      workspaces: ['packages/*', 'apps/*'],
      cwd: '/root',
    });

    console.dir(graph, { depth: 5 });
  });
});

describe('single dependency', () => {
  before(() => {
    const volume = {
      '/root/package.json': JSON.stringify({
        workspaces: ['packages/*'],
      }),
      '/root/packages/a/package.json': JSON.stringify({
        name: 'a',
        dependencies: {},
      }),
      '/root/packages/b/package.json': JSON.stringify({
        name: 'b',
        dependencies: { a: '*', unknown: '*' },
      }),
    };
    mockFs(volume);
  });

  after(() => {
    mockFs.restore();
  });

  it('update validate should fail', async () => {
    await expect(update({ command: '', name: '' })).rejects.toThrow(
      'command is required',
    );
    await expect(update({ command: 'npm run build', name: '' })).rejects.toThrow(
      'name is required',
    );
  });

  it('update', async () => {
    await update({
      command: 'npm run build',
      name: 'build',
      cwd: '/root',
    });

    const b = fs.readFileSync('/root/packages/b/package.json').toString();
    const { wireit } = JSON.parse(b);

    expect(wireit.build.command).toBe('npm run build');
    expect(wireit.build.dependencies).toEqual(['../a:build']);
  });
});

describe('update command seveal dependencies', () => {
  before(() => {
    const volume = {
      '/root/package.json': JSON.stringify({
        workspaces: ['packages/*'],
      }),
      '/root/packages/a/package.json': JSON.stringify({
        name: 'a',
        dependencies: {},
      }),
      '/root/packages/b/package.json': JSON.stringify({
        name: 'b',
        dependencies: {},
      }),
      '/root/packages/c/package.json': JSON.stringify({
        name: 'c',
        dependencies: {
          a: '*',
          b: '*',
        },
      }),
    };
    mockFs(volume);
  });

  after(() => {
    mockFs.restore();
  });

  it('update', async () => {
    await update({
      command: 'npm run build',
      name: 'build',
      cwd: '/root',
    });

    const c = fs.readFileSync('/root/packages/c/package.json').toString();
    const { wireit } = JSON.parse(c);

    expect(wireit.build.command).toBe('npm run build');
    expect(wireit.build.dependencies).toEqual(['../a:build', '../b:build']);
  });
});

describe('sequence', () => {
  before(() => {
    const volume = {
      '/root/package.json': JSON.stringify({
        workspaces: ['packages/*'],
      }),
      '/root/packages/a/package.json': JSON.stringify({
        name: 'a',
        dependencies: {},
      }),
      '/root/packages/b/package.json': JSON.stringify({
        name: 'b',
        dependencies: {
          a: '*',
        },
      }),
      '/root/packages/c/package.json': JSON.stringify({
        name: 'c',
        dependencies: {
          b: '*',
        },
      }),
    };
    mockFs(volume);
  });

  after(() => {
    mockFs.restore();
  });

  it('update', async () => {
    await update({
      command: 'npm run build',
      name: 'build',
      cwd: '/root',
    });

    const c = JSON.parse(fs.readFileSync('/root/packages/c/package.json').toString());

    expect(c.wireit.build).toEqual({
      command: 'npm run build',
      dependencies: ['../b:build'],
    });

    const b = JSON.parse(fs.readFileSync('/root/packages/b/package.json').toString());

    expect(b.wireit.build).toEqual({
      command: 'npm run build',
      dependencies: ['../a:build'],
    });
  });
});
