export interface Customer {
    id: string; type: string; 
    IdCustomer: string; 
    description: string; 
    orderTotal: number; 
    _rid: string; 
    _self: string;
    _etag: string; 
    _attachments: string; 
    _ts: number;
}

export interface BusinessPartner {
    CardCode: string;
    CardName: string;
    CardType: string;
    ContactPerson: string;
    EmailAddress: string;
    Phone1: string;
    VatLiable: string;
    BankCountry: string;
    ShippingType: string;
    // HouseBank: string;
    // HouseBankCountry: string;
    // HouseBankAccount: string;
    GTSBillingAddrTel: string;
    FederalTaxId: string;
    Notes: string;
    ValidRemarks: string;
    BPAddresses: BPAddresses[];
    ContactEmployees: ContactEmployees[];
}

export interface BPAddresses {
    AddressName: string;
    AddressName2: string;
    Street: string;
    Block: string;
    ZipCode: string;
    City: string;
    County: string;
    Country: string;
    State: string;
    TaxCode: string;
    AddressType: string;
    BPCode: string;
    RowNum: string;
}

export interface ContactEmployees {
    CardCode: string;
    Name: string;
    E_Mail: string;
    Phone1: string;
    Fax: string;
    Remarks1: string;
    FirstName: string;
    Address: string;
    LastName: string;
}