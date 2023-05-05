---
to: src/entry-point/main.ts
---
/** Read README.md first */

import { MnModule } from "@primno/core";
import { ListModule } from "../list/list.module";
import { RecordModule } from "../record/record.module";

/**
 * An entry point corresponds to a JS web resource that will be deployed to PowerApps / Dynamics 365.
 * The main module must be exported here to be loaded and run by Primno.
*/

/**
 * The {@link MainModule} class is defined as a module by the {@link MnModule} decorator.
 * A module is a container of components / sub-modules.
 * 
 * {@link MainModule} is the primary module for this entry point and imports the {@link RecordModule} and {@link ListModule}.
 * The `bootstrap` components defined in these sub-modules will be started when the entry point is loaded.
 * 
 * In this architecture, {@link RecordModule} is the primary module for the page type `record`
 * while {@link ListModule} is for the page type `list`.
 * Each page type must have their own component tree (separated boot), this architecture allows for a clear separation.
 */
@MnModule({
    imports: [RecordModule, ListModule]
})
export class MainModule {}