import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as _ from "lodash";
import { CoinRates } from "../../models/rates/rates";
import { RatesStorageService } from "../storage/rates/rates.service";
import { PlatformService } from "../platform/platform.service";

@Injectable({
    providedIn: "root",
})
export class RateService {
    private SAT_TO_BTC = 1 / 1e8;
    private BTC_TO_SAT = 1e8;
    private ratesCachedTime = 60 * 5 * 1000; // 5 minutes;

    public rates = "https://rates.concrete.yuetubi.cn/";

    constructor(
        private http: HttpClient,
        private ratesStorageService: RatesStorageService,
    ) {}

    public async updateRates(coin: string) {
        let ratesResponse = await this.getCoinRates(coin);
        let rates: CoinRates = {
            Rates: ratesResponse,
            LastChecked: Date.now(),
        };
        await this.ratesStorageService.set(coin, rates);
        return;
    }

    public async listAlternatives(sort: boolean) {
        let btcRates = await this.getCoinRates("BTC");
        let alternatives = _.map(btcRates, (item: any) => {
            return {
                code: item.code,
            };
        });
        if (sort) {
            alternatives.sort((a, b) => {
                return a.code.toLowerCase() > b.code.toLowerCase() ? 1 : -1;
            });
        }
        return _.uniqBy(alternatives, "code");
    }

    public async toFiat(
        amount: number,
        alternative: string,
        coin: string
    ): Promise<number> {
        try {
            let rates = await this.ratesStorageService.get(coin);
            if (rates.LastChecked + this.ratesCachedTime < Date.now()) {
                await this.updateRates(coin);
                rates = await this.ratesStorageService.get(coin);
            }
            let coinRates = rates.Rates;
            let alternativeRates = coinRates.find(
                (rate) => rate.code === alternative
            );
            return amount * this.SAT_TO_BTC * alternativeRates.rate;
        } catch (e) {
            await this.updateRates(coin);
            let rates = await this.ratesStorageService.get(coin);
            let coinRates = rates.Rates;
            let alternativeRates = coinRates.find(
                (rate) => rate.code === alternative
            );
            if (alternativeRates.rate === undefined) {
                return 0.0;
            }
            return amount * this.SAT_TO_BTC * alternativeRates.rate;
        }
    }

    public async fromFiat(
        amount: number,
        alternative: string,
        coin: string
    ): Promise<number> {
        try {
            let rates: CoinRates;
            rates = await this.ratesStorageService.get(coin);
            if (rates.LastChecked + this.ratesCachedTime < Date.now()) {
                await this.updateRates(coin);
                rates = await this.ratesStorageService.get(coin);
            }
            let coinRates = rates.Rates;
            let alternativeRates = coinRates.find(
                (rate) => rate.code === alternative
            );
            return Math.floor(
                (amount / alternativeRates.rate) * this.BTC_TO_SAT
            );
        } catch (e) {
            await this.updateRates(coin);
            let rates = await this.ratesStorageService.get(coin);
            let coinRates = rates.Rates;
            let alternativeRates = coinRates.find(
                (rate) => rate.code === alternative
            );
            return Math.floor(
                (amount / alternativeRates.rate) * this.BTC_TO_SAT
            );
        }
    }

    public async getCoinRates(coin: string): Promise<any[]> {
        let res = await this.http
            .get<any>(this.rates + coin.toLowerCase())
            .toPromise();
        return res.data;
    }
}
