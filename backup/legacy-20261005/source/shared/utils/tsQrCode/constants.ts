export enum FieldID {
  version = "00",
  initMethod = "01",
  vietqr = "38",
  category = "52",
  currency = "53",
  amount = "54",
  tipAndFeeType = "55",
  tipAndFeeAmount = "56",
  tipAndFeePercent = "57",
  nation = "58",
  merchantName = "59",
  city = "60",
  zipCode = "61",
  addtionalData = "62",
  crc = "63",
}

export enum ProviderFieldID {
  guid = "00",
  data = "01",
  service = "02",
}

export enum VietQRService {
  byAccountNumber = "QRIBFTTA",
  byCardNumber = "QRIBFTTC",
}

export enum VietQRConsumerFieldID {
  bankBin = "00",
  bankNumber = "01",
}

export enum AdditionalDataID {
  billNumber = "01",
  mobileNumber = "02",
  storeLabel = "03",
  loyaltyNumber = "04",
  referenceLabel = "05",
  customerLabel = "06",
  terminalLabel = "07",
  purposeOfTransaction = "08",
  addtionalConsumerDataRequest = "09",
}

export class Provider {
  constructor(public fieldID: string, public name: string, public guid: string, public service: string) {}
}

export class AdditionalDataModel {
  constructor(
    public billNumber?: string,
    public mobileNumber?: string,
    public store?: string,
    public loyaltyNumber?: string,
    public reference?: string,
    public customerLabel?: string,
    public terminal?: string,
    public purpose?: string,
    public dataRequest?: string,
    public content?: string
  ) {}
}

export class Consumer {
  constructor(public bankBin: string, public bankNumber: string) {}
}

export class Merchant {
  constructor(public id: string, public name: string) {}
}
