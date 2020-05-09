import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";

@Component({
    selector: "app-intro",
    templateUrl: "./intro.page.html",
    styleUrls: ["./intro.page.scss"],
})
export class IntroPage {
    constructor(public navCtrl: NavController) {}

    public async getStarted() {
        await this.navCtrl.navigateForward("/intro/create");
    }
}
