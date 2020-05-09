import { bip32, payments, address } from "bitcoinjs-lib";
import { CoinCredentialsDerivations } from "../wallet/wallet";

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
        HDMasterPubKey: string,
        AddressIndex: number,
        AddressScheme: string,
        Change: boolean
    ): string {
        let nodeBtc = bip32.fromBase58(
            HDMasterPubKey,
            this.getNetwork(AddressScheme)
        );
        let childBtc = nodeBtc.derive(Change ? 1 : 0).derive(AddressIndex);
        let addrBtc;
        if (AddressScheme === "P2WPKH") {
            addrBtc = payments.p2wpkh({
                pubkey: childBtc.publicKey,
                network: this.getNetwork(AddressScheme),
            });
        } else if (AddressScheme === "P2SHInP2WPKH") {
            addrBtc = payments.p2sh({
                redeem: payments.p2wpkh({
                    pubkey: childBtc.publicKey,
                    network: this.getNetwork(AddressScheme),
                }),
            });
        } else {
            addrBtc = payments.p2pkh({
                pubkey: childBtc.publicKey,
                network: this.getNetwork(AddressScheme),
            });
        }
        return addrBtc.address;
    }

    createCredentials(seed, Scheme): CoinCredentialsDerivations {
        let nodeBtc = bip32.fromSeed(seed, this.getNetwork(Scheme));
        let purposeBtc =
            Scheme === "P2PKH" ? "44" : Scheme === "P2SHInP2WPKH" ? "49" : "84";
        let accDerivationBtc =
            "m/" + purposeBtc + "'/" + this.hd_index + "'/0'";
        let accBtc = nodeBtc.derivePath(accDerivationBtc);
        return {
            RootPrivKey: nodeBtc.toBase58(),
            AccountPrivkey: accBtc.toBase58(),
            AccountPublicKey: accBtc.neutered().toBase58(),
            LastDerivationPathChange: 0,
            LastDerivationPathDirect: 0,
        };
    }

    getAddressPrivKey(
        HDMasterPrivkey: string,
        AddressIndex: number,
        AddressScheme: string,
        Change: boolean
    ): string {
        let nodeBtc = bip32.fromBase58(
            HDMasterPrivkey,
            this.getNetwork(AddressScheme)
        );
        let childBtc = nodeBtc.derive(Change ? 1 : 0).derive(AddressIndex);
        return childBtc.toWIF();
    }
}
