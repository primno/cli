import { MnComponent, OnInit } from "@primno/core";

@MnComponent({
    scope: {
        pageType: "entityrecord"
    }
})
export class AppComponent implements OnInit {
    public mnOnInit(): void {
        Xrm.Navigation.openAlertDialog({ text: "Welcome from Primno" });
    }
}