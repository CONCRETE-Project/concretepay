import { Injectable } from "@angular/core";
import { HTTP } from "@ionic-native/http/ngx";
import { HttpClient } from "@angular/common/http";
import * as _ from "lodash";
import {
    Balance,
    BlockbookInfo,
    FeeRates,
    Transaction,
    Utxo,
    XpubFullInfo,
    BlockbookEndpoint,
} from "../../models/blockbook/blockbook";
import { Address, CoinCredentials, Tx } from "../../models/wallet/wallet";
import { PlatformService } from "../platform/platform.service";

@Injectable({
    providedIn: "root",
})
export class BlockbookService {
    public gap = 50;
    public corsAnywhere = "https://cors-anywhere-eabz.herokuapp.com/";

    constructor(
        public http: HttpClient,
        public platform: PlatformService,
        public httpnative: HTTP
    ) {}

    public async getInfo(
        CoinCredentials: CoinCredentials
    ): Promise<XpubFullInfo> {
        let totalBalance: Balance;
        let AddrArray: Address[] = [];
        let TxArray: Tx[];
        let derivationsData = {
            P2PKH: {
                lastDirectAddress: 0,
                lastChangeAddress: 0,
            },
            P2WPKH: {
                lastDirectAddress: 0,
                lastChangeAddress: 0,
            },
            P2SHInP2WPKH: {
                lastDirectAddress: 0,
                lastChangeAddress: 0,
            },
        };
        if (CoinCredentials.isSegwit) {
            let p2wpkhAccountInfo: BlockbookInfo = await this.getAccountInfoWeb(
                CoinCredentials,
                "P2WPKH"
            );
            let p2shAccountInfo: BlockbookInfo = await this.getAccountInfoWeb(
                CoinCredentials,
                "P2SHInP2WPKH"
            );
            derivationsData.P2WPKH = this.getLastAddress(p2wpkhAccountInfo);
            derivationsData.P2SHInP2WPKH = this.getLastAddress(p2shAccountInfo);
            totalBalance = {
                Confirmed:
                    parseInt(p2wpkhAccountInfo.balance, 10) +
                    parseInt(p2shAccountInfo.balance, 10),
                Unconfirmed:
                    parseInt(p2wpkhAccountInfo.unconfirmedBalance, 10) +
                    parseInt(p2shAccountInfo.unconfirmedBalance, 10),
                Locked: 0,
            };
            if (p2wpkhAccountInfo.tokens) {
                AddrArray = p2wpkhAccountInfo.tokens.map((addr) => ({
                    address: addr.name,
                    scheme: "P2WPKH",
                    type: addr.path.split("/")[4] === "0" ? "direct" : "change",
                }));
            }
            if (p2shAccountInfo.tokens) {
                AddrArray = AddrArray.concat(
                    ...p2shAccountInfo.tokens.map((addr) => ({
                        address: addr.name,
                        scheme: "P2SHInP2WPKH",
                        type:
                            addr.path.split("/")[4] === "0"
                                ? "direct"
                                : "change",
                    }))
                );
            }
            let p2wpkhParsedTx = [];
            let p2shParseTx = [];
            if (
                p2wpkhAccountInfo.transactions &&
                p2wpkhAccountInfo.transactions.length > 0
            ) {
                p2wpkhParsedTx = this.parseTransactions(
                    AddrArray,
                    p2wpkhAccountInfo.transactions
                );
            }
            if (
                p2shAccountInfo.transactions &&
                p2shAccountInfo.transactions.length > 0
            ) {
                p2shParseTx = this.parseTransactions(
                    AddrArray,
                    p2shAccountInfo.transactions
                );
            }
            TxArray = [].concat(p2wpkhParsedTx, p2shParseTx);
        } else {
            let p2pkhAccountInfo: BlockbookInfo = await this.getAccountInfoWeb(
                CoinCredentials,
                "P2PKH"
            );

            derivationsData.P2PKH = this.getLastAddress(p2pkhAccountInfo);
            let p2pkhAccountLockedUtxos = await this.getUtxos(CoinCredentials);
            let lockedBalance =
                p2pkhAccountLockedUtxos.length > 0
                    ? p2pkhAccountLockedUtxos
                          .filter((utxo) => utxo.stake_contract)
                          .map((utxo) => {
                              return parseInt(utxo.value);
                          })
                          .reduce((a, b) => {
                              return a + b;
                          })
                    : 0;
            totalBalance = {
                Confirmed: parseInt(p2pkhAccountInfo.balance, 10),
                Unconfirmed: parseInt(p2pkhAccountInfo.unconfirmedBalance, 10),
                Locked: lockedBalance,
            };
            if (p2pkhAccountInfo.tokens) {
                AddrArray = p2pkhAccountInfo.tokens.map((addr) => ({
                    address: addr.name,
                    scheme: "P2PKH",
                    type: addr.path.split("/")[4] === "0" ? "direct" : "change",
                }));
            }
            TxArray = this.parseTransactions(
                AddrArray,
                p2pkhAccountInfo.transactions
            );
        }
        let CleanedArray = _.orderBy(
            _.uniqBy(TxArray, "txid"),
            ["confirmations"],
            "asc"
        );
        return {
            balance: totalBalance,
            transactions: CleanedArray,
            derivations: derivationsData,
        };
    }

    public async getAccountInfoWeb(
        CoinCredentials: CoinCredentials,
        Scheme
    ): Promise<BlockbookInfo> {
        return this.http
            .get<BlockbookInfo>(
                this.getUrl(CoinCredentials) +
                    "/api/v2/xpub/" +
                    CoinCredentials.Derivations[Scheme].AccountPublicKey +
                    "?details=txs&tokens=used&gap=" +
                    this.gap
            )
            .toPromise();
    }

    public getLastAddress(accountInfo: BlockbookInfo) {
        let firstAccountPathsArray = accountInfo.tokens
            ? accountInfo.tokens.map((token) => ({
                  type: token.path.split("/")[4] === "0" ? "direct" : "change",
                  path: token.path.split("/")[5],
              }))
            : [];
        let firstLastDirectpaths = firstAccountPathsArray
            .filter((path) => path.type === "direct")
            .map((path) => parseInt(path.path, 10));
        let firstLastChangepaths = firstAccountPathsArray
            .filter((path) => path.type === "change")
            .map((path) => parseInt(path.path, 10));
        return {
            lastDirectAddress:
                firstLastDirectpaths.length > 0
                    ? Math.max(...firstLastDirectpaths)
                    : 0,
            lastChangeAddress:
                firstLastChangepaths.length > 0
                    ? Math.max(...firstLastChangepaths)
                    : 0,
        };
    }

    public parseTransactions(AddrArray, Txs): Tx[] {
        let parsedTx: Tx[] = [];
        if (Txs && Txs.length > 0) {
            for (let tx of Txs) {
                let inp = [];
                let out = [];
                for (let vin of tx.vin) {
                    if (
                        AddrArray.map((addr) => addr.address).indexOf(
                            vin.addresses[0]
                        ) > -1
                    ) {
                        inp.push({ value: parseInt(vin.value, 10) });
                    }
                }
                for (let vout of tx.vout) {
                    if (
                        AddrArray.filter((addr) => addr.type === "direct")
                            .map((addr) => addr.address)
                            .indexOf(vout.addresses[0]) > -1
                    ) {
                        out.push({
                            value: parseInt(vout.value, 10),
                            ischange: false,
                        });
                    }
                    if (
                        AddrArray.filter((addr) => addr.type === "change")
                            .map((addr) => addr.address)
                            .indexOf(vout.addresses[0]) > -1
                    ) {
                        out.push({
                            value: parseInt(vout.value, 10),
                            ischange: true,
                        });
                    }
                    if (vout.addresses.length > 1) {
                        out.push({
                            value: parseInt(vout.value, 10),
                            stakedvalue: parseInt(vout.value, 10),
                            ischange: false,
                            isstake: true,
                        });
                    }
                }
                let newTx: Tx = {
                    confirmations: tx.confirmations,
                    timestamp: tx.blockTime,
                    inputs: inp,
                    outputs: out,
                    txid: tx.txid,
                    fee: parseInt(tx.fees, 10),
                };
                parsedTx.push(newTx);
            }
            return parsedTx;
        }
    }

    public async getUtxos(CoinCredentials: CoinCredentials): Promise<Utxo[]> {
        let utxos: Utxo[];
        if (CoinCredentials.isSegwit) {
            let p2wpkhUtxos: Utxo[] = await this.getUtxosWeb(
                CoinCredentials,
                "P2WPKH"
            );
            let p2shUtxos: Utxo[] = await this.getUtxosWeb(
                CoinCredentials,
                "P2SHInP2WPKH"
            );
            p2wpkhUtxos.map((utxo) => {
                utxo.scheme = "P2WPKH";
                return utxo;
            });
            p2shUtxos.map((utxo) => {
                utxo.scheme = "P2SHInP2WPKH";
                return utxo;
            });
            utxos = p2wpkhUtxos.concat(p2shUtxos);
        } else {
            let p2pkhUtxos: Utxo[] = await this.getUtxosWeb(
                CoinCredentials,
                "P2PKH"
            );
            p2pkhUtxos.map((utxo) => {
                utxo.scheme = "P2PKH";
                return utxo;
            });
            utxos = p2pkhUtxos;
        }
        return utxos;
    }

    public async getUtxosWeb(
        CoinCredentials: CoinCredentials,
        Scheme
    ): Promise<Utxo[]> {
        return this.http
            .get<Utxo[]>(
                this.getUrl(CoinCredentials) +
                    "/api/v2/utxo/" +
                    CoinCredentials.Derivations[Scheme].AccountPublicKey +
                    "?gap=" +
                    this.gap
            )
            .toPromise();
    }

    public async getFeeRate(
        CoinCredentials: CoinCredentials
    ): Promise<FeeRates> {
        return {
            fast: await this.getFeeWeb(CoinCredentials, 2),
            medium: await this.getFeeWeb(CoinCredentials, 6),
            slow: await this.getFeeWeb(CoinCredentials, 12),
        };
    }

    public async getFeeWeb(
        CoinCredentials: CoinCredentials,
        blocks: number
    ): Promise<any> {
        try {
            let fee: any = await this.http
                .get<string>(
                    this.getUrl(CoinCredentials) +
                        "/api/v1/estimatefee/" +
                        blocks
                )
                .toPromise();
            let feeParsed = parseFloat(fee.result);
            if (feeParsed <= 0 || feeParsed === -1) {
                return 20000;
            }
            return feeParsed * 1e8;
        } catch (e) {
            return 20000;
        }
    }

    public async sendTx(
        CoinCredentials: CoinCredentials,
        rawTx: string
    ): Promise<any> {
        return await this.sendTxWeb(CoinCredentials, rawTx);
    }

    public async sendTxWeb(
        CoinCredentials: CoinCredentials,
        rawTx: string
    ): Promise<any> {
        return this.http
            .post<string>(
                this.getUrl(CoinCredentials) + "/api/v2/sendtx/",
                rawTx
            )
            .toPromise();
    }

    public async getTx(
        CoinCredentials: CoinCredentials,
        txid: string
    ): Promise<Transaction> {
        return await this.getTxWeb(CoinCredentials, txid);
    }

    public async getTxWeb(
        CoinCredentials: CoinCredentials,
        txid: string
    ): Promise<Transaction> {
        return this.http
            .get<Transaction>(
                this.getUrl(CoinCredentials) + "/api/v2/tx/" + txid
            )
            .toPromise();
    }

    public async getSingleCoin(
        endpointURL: string
    ): Promise<BlockbookEndpoint> {
        let req = await this.http
            .get<BlockbookEndpoint>(endpointURL + "/api/")
            .toPromise();
        return req.blockbook.coin;
    }

    public getUrl(coinCredentials: CoinCredentials): string {
        if (this.platform.isAndroid || this.platform.isiOS) {
            return this.corsAnywhere + coinCredentials.Blockbook;
        } else {
            return coinCredentials.Blockbook
        }
    }
}
