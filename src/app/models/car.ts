export class DocumentLines {
    ItemCode?: string;
    ItemDescription?: string;
    Quantity?: number;
    TaxCode?: string;
    UnitPrice?: number;
    LineTotal?: number;
    FreeText?: string;
    Icon?:string;
    DiscountPercent?:string;
    LineNum?:number;
}

export class Order {
    CardCode?: string | null;
    CardName?: string | null;
    DocDueDate?: string;
    DocNum?: number;
    DocEntry?:string;
    DocDate?: string;
    TaxDate?: string;
    DiscountPercent?: number;
    NumAtCard?: string;
    DocumentLines?: DocumentLines[] | undefined;
    AddressExtension?: AddressExtension | undefined;
}

export class AddressExtension{
    ShipToStreet?: string;
    ShipToStreetNo?: string;
    ShipToBlock?: string;
    ShipToBuilding?: string;
    ShipToCity?: string;
    ShipToZipCode?: string;
    ShipToCounty?: string;
    ShipToState?: string;
    ShipToCountry?: string;
    ShipToAddressType?: string;
    BillToStreet?: string;
    BillToStreetNo?: string;
    BillToBlock?: string;
    BillToBuilding?: string;
    BillToCity?: string;
    BillToZipCode?: string;
    BillToCounty?: string;
    BillToState?: string;
    BillToCountry?: string;
    BillToAddressType?: string;
    ShipToAddress2?: string;
    ShipToAddress3?: string;
    BillToAddress2?: string;
    BillToAddress3?: string;
    DocEntry?: 0;
  }

function action(target: DocumentLines, propertyKey: "actualizarInformacion", descriptor: TypedPropertyDescriptor<(nuevaInformacion: string) => void>): void | TypedPropertyDescriptor<(nuevaInformacion: string) => void> {
    throw new Error("Function not implemented.");
}
  