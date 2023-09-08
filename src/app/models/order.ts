export interface Order {
    DocEntry: number
    DocNum: number
    DocumentStatus: string
    Cancelled: any
    DocDate: string
    DocDueDate: string
    TaxDate: string
    CardCode: string
    CardName: string
    NumAtCard: any
    DocTotal: number
    Comments: any
    U_INN_Cust_Portal: any
    DocumentLines: DocumentLines[]
    ShipToCode: any
    AddressExtension: any
  }
  
  export interface DocumentLines {
    ItemCode: string
    FixedItemCode: any
    ItemDescription: string
    Quantity: number
    UnitPrice: string
    LineTotal: string
    Dummie: any
    TaxRate: any
    TaxCode: string
    U_Comments: any
    ItemPrices: any
  }