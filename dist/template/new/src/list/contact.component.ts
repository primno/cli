import { CommandBarEventArg, MnComponent, MnOnCommandInvoke, PageType } from "@primno/core";

/**
 * The {@link ContactComponent} class is defined as a component by the {@link @MnComponent} decorator.
 * This component runs on lists (sub-grid, home-grid, associated-grid) of the `contact` table.
 */
@MnComponent({
    scope: {
        pageType: PageType.list,
        table: "contact"
    }
})
export class ContactComponent {

    /**
     * sayHello is an event handler that will be called
     * when the user click on the command bar button "hello" due to the {@link MnOnCommandInvoke} decorator.
     * 
     * To works, this event must be manually added in the command bar of `contact` table
     * by calling the `mn_main.onCommandInvoke` method with the parameters:
     * - A string parameter with the name `hello` (the name of the command)
     * - SelectedControl
     * - PrimaryControl
     */
    @MnOnCommandInvoke("hello")
    public sayHello(eventArg: CommandBarEventArg) {
        Xrm.Navigation.openAlertDialog({ text: "Hello from Primno." });
    }
}