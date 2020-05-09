export interface ImportModalInput {
    unsafe: boolean;
}

export interface ImportModalResponse {
    success: boolean;
    mnemonic: string;
    language: string;
}
