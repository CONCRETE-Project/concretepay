import { Injectable } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { StoragePluginWeb } from "@capacitor/core";
import { BlockbookService } from "../../blockbook/blockbook.service";

@Injectable({
    providedIn: "root",
})
export class WalletStorageService {
    credentials: CoinCredentials;
    constructor(
        private storage: StoragePluginWeb,
        public blockbookService: BlockbookService
    ) {}

    public async get(id): Promise<Wallet> {
        let walletString = await this.storage.get({ key: id });
        return new Wallet(JSON.parse(walletString.value));
    }

    public async store(wallet: Wallet) {
        await this.storage.set({
            key: "wallet-" + wallet.Properties.id,
            value: JSON.stringify(wallet),
        });
        return;
    }

    public async remove(wallet) {
        await this.storage.remove({ key: "wallet-" + wallet.Properties.id });
        return;
    }

    public async update(wallet: Wallet, property, value) {
        let walletData = await this.storage.get({
            key: "wallet-" + wallet.Properties.id,
        });
        let walletInfo: Wallet = JSON.parse(walletData.value);
        walletInfo.Properties[property] = value;
        await this.storage.set({
            key: "wallet-" + wallet.Properties.id,
            value: JSON.stringify(walletInfo),
        });
        return;
    }

    public async updateCredentials(wallet: Wallet, coin, value) {
        let walletData = await this.storage.get({
            key: "wallet-" + wallet.Properties.id,
        });
        let walletInfo: Wallet = JSON.parse(walletData.value);
        this.credentials = walletInfo.Credentials.wallet;
        this.credentials.Blockbook = value;

        await this.storage.set({
            key: "wallet-" + wallet.Properties.id,
            value: JSON.stringify(walletInfo),
        });
        return;
    }

    public async validateBlockbookLink(wallet: Wallet, coin, value) {
        let valid = false;
        let corsAnywhere = "https://cors-anywhere-eabz.herokuapp.com/";

        let walletData = await this.storage.get({
            key: "wallet-" + wallet.Properties.id,
        });
        let walletInfo: Wallet = JSON.parse(walletData.value);
        this.credentials = walletInfo.Credentials.wallet;
        let endpointResponse = this.blockbookService.getSingleCoin(
            corsAnywhere + value
        );
        let res = await endpointResponse;
        let cmp = res + " (" + this.credentials.Coin + ")";

        if (this.credentials.CoinName === cmp) {
            return (valid = true);
        } else {
            return valid;
        }
    }

    public async resetBlockbookLink(wallet: Wallet, coin) {
        let walletData = await this.storage.get({
            key: "wallet-" + wallet.Properties.id,
        });
        let walletInfo: Wallet = JSON.parse(walletData.value);
        this.credentials = walletInfo.Credentials.wallet;
        this.credentials.Blockbook = this.blockbookService.getUrl(
            this.credentials
        );

        await this.storage.set({
            key: "wallet-" + wallet.Properties.id,
            value: JSON.stringify(walletInfo),
        });
        return;
    }

    public async updateFullWallet(wallet: Wallet) {
        await this.storage.set({
            key: "wallet-" + wallet.Properties.id,
            value: JSON.stringify(wallet),
        });
        return;
    }

    public getAll(onlyUsable: boolean): Promise<Wallet[]> {
        return new Promise<Wallet[]>(async (resolve) => {
            let wallets = [];
            let data = await this.storage.keys();
            let filteredKeys = data.keys.filter(
                (e) => e.substr(0, 7) === "wallet-"
            );
            let filteredKeysLength = filteredKeys.length;
            for (let i = filteredKeysLength; i--; ) {
                wallets.push(await this.get(filteredKeys[i]));
            }
            wallets = wallets.sort((a, b) =>
                a["Properties"]["name"] > b["Properties"]["name"] ? 1 : -1
            );
            if (onlyUsable) {
                let usableWallets = wallets.filter((wallet: Wallet) => {
                    return wallet.Properties.backup === true;
                });
                resolve(usableWallets);
            } else {
                resolve(wallets);
            }
        });
    }

    public removeAll(): Promise<Wallet[]> {
        return new Promise<Wallet[]>(async (resolve) => {
            let data = await this.storage.keys();
            let filteredKeys = data.keys.filter(
                (e) => e.substr(0, 7) === "wallet-"
            );
            let filteredKeysLength = filteredKeys.length;
            for (let i = filteredKeysLength; i--; ) {
                let key = {
                    Properties: {
                        id: filteredKeys[i].substr(7, filteredKeys[i].length),
                    },
                };
                await this.remove(key);
            }
            resolve();
        });
    }
}
