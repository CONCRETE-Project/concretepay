import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
const { Browser } = Plugins;

@Injectable({
    providedIn: "root",
})
export class ExternalLinkService {
    constructor() {}

    public open(link: string) {
        return new Promise(async () => {
            await Browser.open({ url: link });
        });
    }
}
