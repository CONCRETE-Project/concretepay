import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
const { Clipboard } = Plugins;

@Injectable({
    providedIn: "root",
})
export class ClipboardService {
    constructor() {}

    public async copy(value): Promise<any> {
        await Clipboard.write({ string: value });
    }

    public async clear(): Promise<any> {
        await Clipboard.write({
            string: null,
        });
    }
}
