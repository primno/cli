import { MnModule } from "@primno/core";
import { AppComponent } from "./app.component";

@MnModule({
    bootstrap: AppComponent,
    declarations: [
        AppComponent
    ]
})
export class AppModule {

}