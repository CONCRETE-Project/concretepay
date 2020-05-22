import { Injectable } from "@angular/core";
import { StoragePluginWeb } from "@capacitor/core";
import { CoinFactory } from "../../../models/coin-factory/coin-factory";
import { PopupService } from "../../popup/popup.service";
import { CoinsService } from "../../coins-service/coins-service.service";
import { CoinData, CoinFactorySettings } from "src/app/models/coin/coin";

@Injectable({
    providedIn: "root",
})
export class CoinsStorageService {
    public coinsData = "coin-data";

    constructor(
        private storage: StoragePluginWeb,
        public coinsService: CoinsService,
        public popupService: PopupService
    ) {}

    async get(): Promise<CoinFactorySettings> {
        let settings = await this.storage.get({ key: this.coinsData });
        return JSON.parse(settings.value);
    }

    async set(coinsData: CoinFactorySettings) {
        await this.storage.set({
            key: this.coinsData,
            value: JSON.stringify(coinsData),
        });
        return;
    }

    async clear() {
        await this.storage.remove({
            key: this.coinsData,
        });
        return;
    }

    async loadCoinsFromRemote() {
        try {
            let coinsInfo = await this.coinsService.getCoins();
            // Attempt to load data from remote
            let coinsConf: CoinData[] = [];
            for (let coin of coinsInfo.coins_tickers) {
                let coinRaw = await this.coinsService.getCoinInfo(coin);
                let coinData = new CoinData(coinRaw);
                CoinFactory.coins[coinData.tag] = coinData;
                coinsConf.push(coinData);
            }
            let coinsData: CoinFactorySettings = {
                availableCoins: coinsInfo.coins_available,
                coins: coinsConf,
            };
            await this.set(coinsData);
            await this.clearCoinFactory();
            await this.setCoinFactory(coinsConf);
        } catch (e) {
            console.log(e);
            // If it fails, means there is no access for coin data on remote or local, crash the app with a popup.
            await this.popupService.ionicAlert(
                "common.error",
                "services.load-coins-error"
            );
        }
    }

    async loadCoinsInfo() {
        return new Promise(async (resolve) => {
            try {
                // Try to load coins stored
                let coinsStored = await this.get();
                if (!coinsStored || coinsStored.coins.length === 0) {
                    await this.loadCoinsFromRemote();
                }
                // Check against remote server the amount of coins
                try {
                    let amount = await this.coinsService.getCoins();
                    if (amount.coins_available > coinsStored.availableCoins) {
                        await this.loadCoinsFromRemote();
                    }
                } catch (e) {
                    console.log(e);
                    await this.setCoinFactory(coinsStored.coins);
                    resolve();
                }
                await this.setCoinFactory(coinsStored.coins);
                resolve();
            } catch (e) {
                // If there is an error, just reload all the information
                console.log(e);
                await this.loadCoinsFromRemote();
                resolve();
            }
        });
    }

    async setCoinFactory(coinRawData: CoinData[]) {
        for (let coin of coinRawData) {
            let coinData = new CoinData(coin);
            CoinFactory.coins[coinData.tag] = coinData;
        }
    }

    async clearCoinFactory() {
        CoinFactory.coins = [];
    }
}
