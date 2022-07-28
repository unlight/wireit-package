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
npm run -w wireit-package test:w
npm run -w wireit-package build
```

## License

MIT License, Copyright (c) 2022
