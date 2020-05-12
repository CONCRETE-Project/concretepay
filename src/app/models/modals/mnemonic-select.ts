import { CoinCredentials } from "../wallet/wallet";

export interface MnemonicSelectResponse {
    success: boolean;
    mnemonic: string;
    language: string;
}
