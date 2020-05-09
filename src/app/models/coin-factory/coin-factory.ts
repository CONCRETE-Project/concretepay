import { CoinData } from "../coin/coin";

export class CoinFactory {
    static coins = {};

    public static getCoin(tag: string): CoinData {
        tag = tag.toUpperCase();
        return CoinFactory.coins[tag];
    }

    public static CoinList(): CoinData[] {
        let CoinList = [];
        for (let key in CoinFactory.coins) {
            if (key) {
                CoinList.push(CoinFactory.coins[key]);
            }
        }
        return CoinList;
    }
}
