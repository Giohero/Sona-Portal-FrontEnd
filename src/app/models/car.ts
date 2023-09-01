export interface DocumentLines {
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    TaxCode: string;
    UnitPrice: string;
    LineTotal: number;
}

export class Order {
    CardCode?: string | null;
    DocDueDate?: string;
    DocDate?: string;
    TaxDate?: string;
    DocumentLine: DocumentLines[] | undefined;
}