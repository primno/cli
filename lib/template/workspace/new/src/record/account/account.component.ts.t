---
to: src/record/account/account.component.ts
---
import { MnComponent, MnOnFormLoad, FormEventArg, MnSubComponent, SubComponent } from "@primno/core";
import { NotifyColumnChangeComponent } from "./notify-column-change.component";

/**
 * The {@link AccountComponent} class is defined as a component by the {@link @MnComponent} decorator.
 * A component is a class that contains an individual piece of functionality to apply to a form or a grid.
 * This sample component will show a notification when the form is loaded and when the name column is changed.
 */
@MnComponent({
    /**
     * The scope define when the component will be loaded.
     * In this case, the component will be loaded on forms of the account table.
    */
    scope: {
        pageType: "record",
        table: "account"
    }
})
export class AccountComponent {
    /**
     * onFormLoad is an event handler that will be called when the form is loaded due to the {@link MnOnFormLoad} decorator.
     * Show the alert "Welcome from Primno".
     */
    @MnOnFormLoad()
    public onFormLoad(eventArg: FormEventArg) {
        Xrm.Navigation.openAlertDialog({ text: "Welcome from Primno" });
    }

    /**
     * notifyNameChange is a sub-component of {@link AccountComponent}.
     * {@link NotifyColumnChangeComponent} notify the user when a column is changed.
     * 
     * This sub-component is linked to the column "name" of the form.
     */
    @MnSubComponent({
        /** Define the sub-component type */
        component: NotifyColumnChangeComponent,
        /** Define the input of the sub-component */
        input: {
            columnName: "name"
        }
    })
    public notifyNameChange!: SubComponent<NotifyColumnChangeComponent>;

    /**
     * notifyTelephone1Change is an other sub-component that is linked to the column "telephone1" of the form.
     * 
     * When the column "telephone1" is changed, the user will be also notified.
     */
    @MnSubComponent({
        component: NotifyColumnChangeComponent,
        input: {
            columnName: "telephone1"
        }
    })
    public notifyTelephone1Change!: SubComponent<NotifyColumnChangeComponent>;
}