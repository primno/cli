# @primno/cli

## 0.8.0

### Minor Changes

- aba3e5b: Runs the local CLI when the global CLI is running in a Primno workspace.

  BREAKING CHANGE:
  Does not work with previous versions.

- cfe6e6a: BREAKING CHANGE:
  Move the `environment` property from the deploy section to the root.
- e57e20d: Use of plop as template engine.
  The creation of workspaces is now done with plop.
- 47bb5ed: Opens the environment url when the start command is executed.
  Added "--no-open" option in the start command. If this option is set, the environment will not be opened in the browser.
- 2fde638: BREAKING CHANGE:
  The file structure changes. Only one entry point is now supported.
  This entry point must be a file named "app.entry.ts" in the source directory of the project.

  To migrate, move your entry point from your entry-point directory to "app.entry.ts" in the source directory.
  If you have multiple entry points, you must create a new project for each entry point or merge them into one.

  The `entryPoints` properties of the primno configuration and the `entrypoint` option of the CLI was removed.

- 2e1fa7d: Component generator.

### Patch Changes

- 34729bd: Remove warnings from node_modules packages during build.

## 0.7.0

### Patch Changes

- 4871459: Added @primno/dataverse-auth package and updated @primno/dataverse-client.
