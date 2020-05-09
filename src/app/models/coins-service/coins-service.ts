export interface CoinsServiceRequest {
    version: number;
}

export interface CoinsServiceResponse {
    coins_available: number;
    coins_tickers: string[];
}

export interface BaseResponse {
    data: any;
    status: number;
    error: string;
}
