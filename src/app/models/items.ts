export interface ItemPrice {
    PriceList: number;
    Price: number;
    Currency: string;
    AdditionalPrice1?: number;
    AdditionalCurrency1?: string | null;
    AdditionalPrice2?: number | null;
    AdditionalCurrency2?: string | null;
    BasePriceList: number;
    Factor: number;
    UoMPrices: object[];
}

export interface Value {
    odata_etag: string;
    ItemCode: string;
    ItemName: string;
    BarCode: string;
    ItemsGroupCode: number;
    ItemPrices: ItemPrice[];
}

export interface Root {
    odatametadata: string;
    odatanextLink: string;
    value: Value[];
}

export interface Item {
    Value:  Value;
    Root:  Root;
    ItemPrice:  ItemPrice;
}