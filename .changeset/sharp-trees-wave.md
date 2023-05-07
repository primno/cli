---
"@primno/cli": minor
---

BREAKING CHANGE:
The file structure changes. Only one entry point is now supported.
This entry point must be a file named "app.entry.ts" in the source directory of the project.

To migrate, move your entry point from your entry-point directory to "app.entry.ts".
If you have multiple entry points, you must create a new project for each entry point or merge them into one.

The `entryPoints` properties of the primno configuration and the `entrypoint` option of the CLI was removed.