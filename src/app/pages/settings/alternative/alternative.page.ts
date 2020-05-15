import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { NavController } from "@ionic/angular";
import { RateService } from "../../../services/rate/rate.service";

@Component({
    selector: "app-alternative",
    templateUrl: "./alternative.page.html",
    styleUrls: ["./alternative.page.scss"],
})
export class AlternativePage implements OnInit {
    public completeAlternativeList;
    public searchedAltCurrency: string;
    public altCurrencyList;
    public currentCurrency;
    public lastUsedAltCurrencyList = [];
    private PAGE_COUNTER = 3;
    private SHOW_LIMIT = 10;
    private unusedCurrencyList;

    constructor(
        public userSettingsStorage: UserSettingsStorageService,
        public navController: NavController,
        public rateService: RateService
    ) {}

    async ngOnInit() {
        await this.init();
    }

    public async init() {
        this.completeAlternativeList = await this.rateService.listAlternatives(
            true
        );
        let idx = _.keyBy(this.unusedCurrencyList, "code");
        let idx2 = _.keyBy(this.lastUsedAltCurrencyList, "code");

        this.completeAlternativeList = _.reject(
            this.completeAlternativeList,
            (c) => {
                return idx[c.code] || idx2[c.code];
            }
        );
        this.altCurrencyList = this.completeAlternativeList.slice(0, 20);
        await this.getLastAlt();
    }

    public async loadAltCurrencies(loading) {
        if (
            this.altCurrencyList.length === this.completeAlternativeList.length
        ) {
            loading.target.complete();
            return;
        }
        setTimeout(async () => {
            this.altCurrencyList = this.completeAlternativeList.slice(
                0,
                this.PAGE_COUNTER * this.SHOW_LIMIT
            );
            this.PAGE_COUNTER++;
            loading.target.complete();
        }, 300);
    }

    private saveLastUsed(newAltCurrency): void {
        this.lastUsedAltCurrencyList.unshift(newAltCurrency);
        this.lastUsedAltCurrencyList = _.uniqBy(
            this.lastUsedAltCurrencyList,
            "code"
        );
        this.lastUsedAltCurrencyList = this.lastUsedAltCurrencyList.slice(0, 3);
    }

    public async save(newAltCurrency) {
        this.saveLastUsed(newAltCurrency);
        await this.userSettingsStorage.set("alt_coin", newAltCurrency);
        await this.navController.navigateRoot("/home");
    }

    public findCurrency(searchedAltCurrency: string): void {
        this.altCurrencyList = _.filter(
            this.completeAlternativeList,
            (item) => {
                let val = item.code;
                return _.includes(
                    val.toLowerCase(),
                    searchedAltCurrency.toLowerCase()
                );
            }
        );
    }

    public async getLastAlt() {
        let AltObj: any = await this.userSettingsStorage.get("alt_coin");
        this.currentCurrency = AltObj.code || "USD";
        this.lastUsedAltCurrencyList.push(AltObj);
    }
}
