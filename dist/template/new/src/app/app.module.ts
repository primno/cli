import { MnModule } from "@primno/core";
import { AppComponent } from "./app.component";

/**
 * The AppModule class is defined as a module by the @MnModule decorator.
 * A module is a container of components.
 */
@MnModule({
    /**
     * The bootstrap property defines that AppComponent will be the root component of the module
     * and will be created when the module is loaded.
    */
    bootstrap: AppComponent,
    /**
     * The declarations property defines the components that will be available to be child components of the others components of this module.
     * In this case, the AppComponent is the only component of this module.
     * If you want to create a component that will be a child of the AppComponent, you must define it in the declarations property.
     * A component can be declared in only one module.
    */
    declarations: [
        AppComponent
    ]
})
export class AppModule {

}