import { MnModule } from "@primno/core";
import { ContactComponent } from "./contact.component";

/**
 * The AppModule class is defined as a module by the {@link MnModule} decorator.
 * A module is a container of components.
 */
@MnModule({
    /**
     * The bootstrap property defines that {@link RecordComponent} will be the root component of this module
     * and will be created when the module is loaded.
    */
    bootstrap: ContactComponent,
    /**
     * The declarations property defines the components that will be available to be child components of the others components of this module.
     * In this case, the {@link RecordComponent} is the only component of this module.
     * If you want to create a component that will be a child of the {@link RecordComponent}, you must define it in the declarations property.
     * A component can be declared in only one module.
    */
    declarations: [
        ContactComponent
    ]
})
export class ListModule {

}