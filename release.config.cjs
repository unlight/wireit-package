module.exports = {
  extends: ['semantic-release-commit-filter'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        pkgRoot: './dist',
      },
    ],
    [
      '@semantic-release/exec',
      {
        publishCmd: "npm publish ./dist --tag ${nextRelease.channel || 'latest'}",
      },
    ],
    '@semantic-release/git',
    '@semantic-release/github',
  ],
};
