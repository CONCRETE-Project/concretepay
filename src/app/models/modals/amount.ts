export interface AmountModalResponse {
    amount: number;
    useSendMax: boolean;
    success: boolean;
}

export interface AmountModalInput {
    coin: string;
    alternative: string;
}
