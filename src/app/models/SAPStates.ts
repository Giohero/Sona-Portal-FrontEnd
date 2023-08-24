export interface SAPStates {
    OdataMetadata: string | undefined;
    value?: State[] | undefined;
}

export interface State {
    Code: string | undefined;
    Country: string | undefined;
    Name: string | undefined;
}