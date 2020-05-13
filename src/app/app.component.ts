import { Component } from "@angular/core";
import { NavController, Platform } from "@ionic/angular";
import { UserSettingsStorageService } from "./services/storage/user-settings/user-settings.service";
import { Plugins } from "@capacitor/core";
import { UserSettingsModel } from "./models/user-settings/user-settings";
import { PlatformService } from "./services/platform/platform.service";
const { SplashScreen } = Plugins;
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private platformService: PlatformService,
        public userSettingsStorage: UserSettingsStorageService,
        public navCtrl: NavController,
        public translate: TranslateService
    ) {
        this.initializeApp().then();
    }

    async initializeApp() {
        await this.platform.ready();
        await SplashScreen.hide();
        await this.onAppLoad();
    }

    private async onAppLoad() {
        let UserSettings = await this.userSettingsStorage.getAll();
        if (!UserSettings) {
            let DefaultSettings: UserSettingsModel = {
                alt_coin: {
                    code: "USD",
                },
                lang: await this.platformService.getLangCode(),
                first_time: true,
            };
            this.translate.setDefaultLang("en");
            this.userSettingsStorage.setAll(DefaultSettings).then(async () => {
                await this.navCtrl.navigateRoot("/intro");
            });
        } else {
            let firstTime = await this.userSettingsStorage.get("first_times");
            if (firstTime) {
                this.translate.setDefaultLang("en");
                await this.navCtrl.navigateRoot("/intro");
            } else {
                let lang = await this.userSettingsStorage.get("lang");
                this.translate.setDefaultLang(lang);
                await this.navCtrl.navigateRoot("/home");
            }
        }
    }
}
