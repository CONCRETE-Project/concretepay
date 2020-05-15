import { bip32, payments, address } from "bitcoinjs-lib";
import {
    CoinCredentialsDerivations,
    CoinCredentials,
    Wallet,
} from "../wallet/wallet";
import * as bip39 from "bip39";

export interface Bip32 {
    public: number;
    private: number;
}

export interface Network {
    messagePrefix: string;
    bech32: string;
    bip32: Bip32;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}

export interface Networks {
    P2PKH?: Network;
    P2WPKH?: Network;
    P2SHInP2WPKH?: Network;
    ETHEREUM?: Network;
}

export interface CoinFactorySettings {
    coins: CoinData[];
    availableCoins: number;
}

export class CoinData {
    constructor(obj) {
        Object.assign(this, obj);
    }
    icon: string;
    tag: string;
    name: string;
    segwit: boolean;
    blockbook: string;
    protocol: string;
    tx_version: number;
    hd_index: number;
    networks: Networks;

    validateAddress(addr: string): boolean {
        try {
            address.toOutputScript(addr, this.getNetwork());
            return true;
        } catch (e) {
            return false;
        }
    }

    getNetwork(type?: string): Network {
        if (!type) {
            if (this.segwit) {
                return this.networks.P2SHInP2WPKH;
            } else {
                return this.networks.P2PKH;
            }
        } else {
            return this.networks[type];
        }
    }

    getAddressPubKey(
        extPubKey: string,
        index: number,
        scheme: string,
        change: boolean
    ): string {
        let accNode = bip32.fromBase58(extPubKey, this.getNetwork(scheme));
        let addrChild = accNode.derive(change ? 1 : 0).derive(index);
        let addr;
        if (scheme === "P2WPKH") {
            addr = payments.p2wpkh({
                pubkey: addrChild.publicKey,
                network: this.getNetwork(scheme),
            });
        } else if (scheme === "P2SHInP2WPKH") {
            addr = payments.p2sh({
                redeem: payments.p2wpkh({
                    pubkey: addrChild.publicKey,
                    network: this.getNetwork(scheme),
                }),
            });
        } else {
            addr = payments.p2pkh({
                pubkey: addrChild.publicKey,
                network: this.getNetwork(scheme),
            });
        }
        return addr.address;
    }

    createCredentials(seed, scheme): CoinCredentialsDerivations {
        let node = bip32.fromSeed(seed, this.getNetwork(scheme));
        let purposeBtc =
            scheme === "P2PKH" ? "44" : scheme === "P2SHInP2WPKH" ? "49" : "84";
        let accDerivation = "m/" + purposeBtc + "'/" + this.hd_index + "'/0'";
        let accBtc = node.derivePath(accDerivation);
        return {
            AccountPublicKey: accBtc.neutered().toBase58(),
            LastDerivationPathChange: 0,
            LastDerivationPathDirect: 0,
        };
    }

    async getAddressPrivKey(
        index: number,
        mnemonic: string,
        pass: string,
        scheme: string,
        change: boolean
    ): Promise<string> {
        // TODO derive root.
        let seed = await bip39.mnemonicToSeed(mnemonic, pass);
        let rootNode = bip32.fromSeed(seed, this.getNetwork(scheme));
        let purpose =
            scheme === "P2PKH" ? "44" : scheme === "P2SHInP2WPKH" ? "49" : "84";
        let accDerivation = "m/" + purpose + "'/" + this.hd_index + "'/0'";
        let accNode = rootNode.derivePath(accDerivation);
        let addrChild = accNode.derive(change ? 1 : 0).derive(index);
        return addrChild.toWIF();
    }
}
