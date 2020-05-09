import { Component, OnDestroy, OnInit } from "@angular/core";
import { Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { PopupService } from "../../../../services/popup/popup.service";

@Component({
    selector: "app-color",
    templateUrl: "./color.page.html",
    styleUrls: ["./color.page.scss"],
})
export class WalletColorPage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;
    public colorCount: number[];
    public currentColorIndex: number;
    private retries: number;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public popupService: PopupService,
        public navController: NavController
    ) {}

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            const COLOR_COUNT = 14;
            let walletid = params.get("walletid");
            this.wallet = await this.walletServiceStorage.get(
                "wallet-" + walletid
            );
            this.colorCount = Array(COLOR_COUNT)
                .fill(0)
                .map((_, i) => i);
            this.setCurrentColorIndex();
        });
    }

    public async save(i) {
        let color = this.indexToColor(i);
        try {
            await this.walletServiceStorage.update(this.wallet, "color", color);
            await this.navController.navigateRoot("/home", {
                animated: true,
                animationDirection: "back",
            });
        } catch (e) {
            await this.popupService.ionicAlert(
                "Error: ",
                "Unable to change wallet color: " + e
            );
        }
    }

    private setCurrentColorIndex(): void {
        try {
            this.currentColorIndex = this.colorToIndex(
                this.wallet.Properties.color
            );
        } catch (e) {
            // Wait for DOM to render and try again.
            setTimeout(() => {
                if (this.retries > 0) {
                    this.retries -= 1;
                    this.setCurrentColorIndex();
                }
            }, 100);
        }
    }

    private colorToIndex(color: string) {
        for (let i = 0; i < this.colorCount.length; i++) {
            if (this.indexToColor(i) === color.toLowerCase()) {
                return i;
            }
        }
        return undefined;
    }

    private indexToColor(i: number): string {
        // Expect an exception to be thrown if can't getComputedStyle().
        return this.rgb2hex(
            (window as any).getComputedStyle(
                document.getElementsByClassName("wallet-color-" + i)[0]
            ).backgroundColor
        );
    }

    private rgb2hex(rgb): string {
        rgb = rgb.match(
            /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
        );
        return rgb && rgb.length === 4
            ? "#" +
                  ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                  ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                  ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
            : "";
    }
}
