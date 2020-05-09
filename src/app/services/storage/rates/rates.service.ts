import { Injectable } from "@angular/core";
import { StoragePluginWeb } from "@capacitor/core";
import { CoinRates } from "../../../models/rates/rates";

@Injectable({
    providedIn: "root",
})
export class RatesStorageService {
    constructor(private storage: StoragePluginWeb) {}

    async get(coin: string): Promise<CoinRates> {
        let rateStr = await this.storage.get({ key: "rates-" + coin });
        return JSON.parse(rateStr.value);
    }

    async set(coin: string, rates: CoinRates) {
        let rateStr = JSON.stringify(rates);
        await this.storage.set({ key: "rates-" + coin, value: rateStr });
        return;
    }

    async clear() {
        let data = await this.storage.keys();
        let filteredKeys = data.keys.filter((e) => e.substr(0, 6) === "rates-");
        let filteredKeysLength = filteredKeys.length;
        for (let i = filteredKeysLength; i--; ) {
            await this.storage.remove({ key: filteredKeys[i] });
        }
        return;
    }
}
