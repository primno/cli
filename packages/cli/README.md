# Primno CLI

[![npm](https://img.shields.io/npm/v/@primno/cli.svg)](https://www.npmjs.com/package/@primno/cli)
[![npm](https://img.shields.io/npm/l/@primno/cli.svg)](https://github.com/primno/cli/blob/main/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/primno/cli/test.yml)

Primno CLI is a command-line interface tool for initializing, building, and deploying [Primno](https://github.com/primno/primno) projects from a command shell.

> **Important**
> primno is in beta stage and subject to change.

## Documentation

The documentation can be found on [https://primno.io](https://primno.io).

- [Getting Started](https://primno.io/docs/getting-started)
- [CLI](https://primno.io/docs/guides/cli)
- [Guides](https://primno.io/docs/guides)
- [API Reference](https://primno.io/docs/api-reference)

## Installation

```bash
npm install -g @primno/cli
```

## Commands

- `mn new <name>` - Create a new primno project.
- `mn build` - Build project.
- `mn watch` - Watch project for changes.
- `mn start` - Start the project during development cycle.
- `mn deploy` - Build and deploy project to D365.
