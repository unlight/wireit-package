# wireit-package

Update wireit scripts across your workspace packages

## Install

```sh
npm install --save-dev wireit-package
```

## Usage

```sh
npx wireit-package update --command "npm run build" --name "build"
```

Result:

```json
"wireit": {
  "build": {
    "command": "npm run build",
    "dependencies": [
      "../../packages/foo:build"
    ]
  }
}
```

## Development

```sh
npm -w wireit-package run test:w
npm -w wireit-package run build
```

## License

MIT License, Copyright (c) 2022
