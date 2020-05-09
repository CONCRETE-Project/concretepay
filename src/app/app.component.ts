import { Component } from "@angular/core";
import { NavController, Platform } from "@ionic/angular";
import { UserSettingsStorageService } from "./services/storage/user-settings/user-settings.service";
import { Plugins } from "@capacitor/core";
import { UserSettingsModel } from "./models/user-settings/user-settings";
const { SplashScreen } = Plugins;

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
})
export class AppComponent {
    constructor(
        private platform: Platform,
        public userSettingsStorage: UserSettingsStorageService,
        public navCtrl: NavController
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
                    name: "US Dollar",
                    code: "USD",
                },
                first_time: true,
            };
            this.userSettingsStorage.setAll(DefaultSettings).then(async () => {
                await this.navCtrl.navigateRoot("/intro");
            });
        } else {
            let firstTime = await this.userSettingsStorage.get("first_times");
            if (firstTime) {
                await this.navCtrl.navigateRoot("/intro");
            } else {
                await this.navCtrl.navigateRoot("/home");
            }
        }
    }

    public async goToPage(page) {
        if (page.title !== "Home") {
            await this.navCtrl.navigateForward(page.url, {
                animated: true,
                animationDirection: "forward",
            });
        } else {
            await this.navCtrl.navigateRoot(page.url, {
                animated: true,
                animationDirection: "forward",
            });
        }
    }
}
