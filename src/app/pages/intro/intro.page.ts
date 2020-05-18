import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";
import { UserSettingsStorageService } from "src/app/services/storage/user-settings/user-settings.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-intro",
    templateUrl: "./intro.page.html",
    styleUrls: ["./intro.page.scss"],
})
export class IntroPage {
    languageSelected: boolean = false;
    constructor(
        public navCtrl: NavController,
        public userSettings: UserSettingsStorageService,
        public translate: TranslateService
    ) {}

    public async getStarted() {
        await this.navCtrl.navigateForward("/intro/create");
    }

    public async selectLanguage(string) {
        await this.userSettings.set("lang", string);
        this.translate.setDefaultLang(string);
        this.languageSelected = true;
    }
}
