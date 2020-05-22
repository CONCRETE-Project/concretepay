import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { PlatformService } from "../platform/platform.service";
import {
    CoinsServiceResponse,
    BaseResponse,
} from "src/app/models/coins-service/coins-service";
import { CoinData } from "src/app/models/coin/coin";

@Injectable({
    providedIn: "root",
})
export class CoinsService {
    public url = "http://114.67.97.142:8081/";
    public corsAnywhere = "https://cors-anywhere-eabz.herokuapp.com/";

    constructor(
        private http: HttpClient,
        private platformService: PlatformService
    ) {}

    async getCoins(): Promise<CoinsServiceResponse> {
        let res = await this.http
            .get<BaseResponse>(
                this.corsAnywhere +
                    this.url +
                    "coins/" +
                    this.platformService.version.toString()
            )
            .toPromise();
        return res.data;
    }

    async getCoinInfo(tag: string): Promise<CoinData> {
        let res = await this.http
            .get<BaseResponse>(this.corsAnywhere + this.url + "coin/" + tag)
            .toPromise();
        return res.data;
    }

    async getStakeAddress(tag: string): Promise<string> {
        try {
            let res = await this.http
                .get<BaseResponse>(
                    this.corsAnywhere + this.url + "stake/" + tag
                )
                .toPromise();
            return res.data;
        } catch (e) {
            return null;
        }
    }
}
