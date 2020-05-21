import { Component, Input } from "@angular/core";
import { NavController } from "@ionic/angular";
import { PlatformService } from "../../services/platform/platform.service";

@Component({
    selector: "app-tool-bar",
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
})
export class ToolBarComponent {
    addPaddingTop = false;
    @Input() back: boolean;
    @Input() titleText: string;
    @Input() logo: boolean;
    constructor(
        public navController: NavController,
        public platformService: PlatformService
    ) {
        this.init().then();
    }

    async init() {
        if (this.platformService.isElectron) {
            this.addPaddingTop = true;
        }
    }

    public async goToSettings() {
        await this.navController.navigateForward("/settings", {
            animated: true,
            animationDirection: "forward",
        });
    }
}
