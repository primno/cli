import { MnComponent, PageType, MnOnFormLoad, MnOnColumnChange, FormEventArg, Config, Input, MnInput, MnConfig, ConfigOf } from "@primno/core";

/**
 * This component notifies the user when a column is changed.
 * The column name to watch is defined by the input of the component.
 */
@MnComponent({
    scope: {
        pageType: PageType.record
    }
})
export class NotifyColumnChangeComponent implements Config, Input {
    /**
     * The input of the component is defined by the {@link MnInput} decorator.
     * Here, the input is a simple object with a property "columnName" that is the name of the column to watch.
     */
    @MnInput()
    input!: {
        columnName: string;
    };

    /**
     * The config of the component is defined by the {@link MnConfig} decorator.
     * It is the own data of the component that can be constructed by the `input`.
     * Here, the config is the same as the input.
     * 
     * This data can be used by event decorators like {@link MnOnColumnChange} to define the column to watch.
     */
    @MnConfig(i => i)
    config!: {
        columnName: string;
    };

    private previousValue = "";

    /**
     * Set the previous value of the column when the form is loaded.
     * @param eventArg 
     */
    @MnOnFormLoad()
    public onFormLoad(eventArg: FormEventArg) {
        this.previousValue = eventArg.formCtx.getAttribute(this.config.columnName).getValue();
    }
    
    /**
     * When the column is changed, show a notification with the previous and the new value.
     * 
     * The column name is given by the config of the component.
     * This way the column to watch is not hard-coded and can be changed by the input of the component.
     * 
     * {@link ConfigOf} provides the type of the config of the component.
     * @param eventArg 
     */
    @MnOnColumnChange((c: ConfigOf<NotifyColumnChangeComponent>) => c.columnName)
    public onChange(eventArg: FormEventArg) {
        const columnValue = eventArg.formCtx.getAttribute(this.config.columnName).getValue();

        eventArg.formCtx.ui.setFormNotification(
            `The value of the column ${this.config.columnName} changed from ${this.previousValue} to ${columnValue}`,
            "INFO",
            "columnValueChanged"
        );
    }
}