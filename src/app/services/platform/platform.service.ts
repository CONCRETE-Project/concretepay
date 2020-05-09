import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";

@Injectable({
    providedIn: "root",
})
export class PlatformService {
    public isAndroid: boolean;
    public isiOS: boolean;
    public isCordova: boolean;
    public isElectron: boolean;
    public ua: string;

    // Version shouldn't include text
    public version = 1;

    constructor(private platform: Platform) {
        let ua = navigator ? navigator.userAgent : null;
        if (!ua) {
            ua = "dummy user-agent";
        }
        ua = ua.replace(/\(\d+\)$/, "");
        this.isAndroid = this.platform.is("android");
        this.isiOS = this.platform.is("ios");
        this.isElectron = this.platform.is("electron");
        this.isCordova = this.platform.is("cordova");
        this.ua = ua;
    }
}
