import { MnDomain, FluentDomainInitializer, DomainBase } from "@primno/core";

@MnDomain({
    entityName: "account"
})
export class HelloWorldDomain extends DomainBase {
    protected onComponentRegister(domainInitializer: FluentDomainInitializer): void {
        Xrm.Navigation.openAlertDialog({text: "Hello from Primno"});
    }
}
