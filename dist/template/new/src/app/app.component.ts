import { MnComponent, PageType, MnOnFormLoad, MnOnFieldChange, FormEventArg } from "@primno/core";

/**
 * The AppComponent class is defined as a component by the @MnComponent decorator.
 * A component is a class that contains an individual piece of functionality to apply to a form or a grid.
 * This sample component will show a notification when the form is loaded and when the name field is changed.
 */
@MnComponent({
    /**
     * The scope define when the component will be loaded.
     * In this case, the component will be loaded on forms of the account entity.
    */
    scope: {
        pageType: PageType.record,
        entityName: "account"
    }
})
export class AppComponent {
    /**
     * onFormLoad is an event handler that will be called when the form is loaded due to the @MnOnFormLoad decorator.
     * Show the notification "Welcome from Primno".
     */
    @MnOnFormLoad()
    public onFormLoad(eventArg: FormEventArg) {
        eventArg.formCtx.ui.setFormNotification("Welcome from Primno", "INFO", "welcome");
    }

    /**
     * onNameChange is an event handler that will be called when the name field is changed due to the @MnOnFieldChange decorator.
     * Show the notification "Name changed to <name>".
    */
    @MnOnFieldChange("name")
    public onNameChange(eventArg: FormEventArg) {
        const name = eventArg.formCtx.getAttribute("name").getValue();
        eventArg.formCtx.ui.setFormNotification(`Name changed to ${name}`, "INFO", "nameChanged");
    }
}