---
to: src/record/record.module.ts
---
import { MnModule } from "@primno/core";
import { AccountComponent } from "./account/account.component";
import { NotifyColumnChangeComponent } from "./account/notify-column-change.component";

/**
 * The {@link RecordModule} class is defined as a module by the {@link MnModule} decorator.
 * A module is a container of components.
 * 
 * This module is the primary module for the page type `record`,
 * so all components that will be used in the page type `record` must be declared in this module or in its sub-modules.
 */
@MnModule({
    /**
     * The `bootstrap` property defines that {@link AccountComponent} will be the root component of this module
     * and will be created when the module is loaded.
    */
    bootstrap: [AccountComponent],
    /**
     * The `declarations` property defines the components that will be available
     * to be child components of the others components of this module.
     * 
     * In this case, {@link AccountComponent} and {@link NotifyColumnChangeComponent} are the available components in this module.
     * If you want to create a component in this module that will be a child of the {@link AccountComponent},
     * you must add it in this declarations property.
     * 
     * A component can be declared in only one module.
    */
    declarations: [
        AccountComponent,
        NotifyColumnChangeComponent
    ]
})
export class RecordModule {}