enum FieldID {
  version = '00',
  initMethod = '01',
  vietqr = '38',
  category = '52',
  currency = '53',
  amount = '54',
  tipAndFeeType = '55',
  tipAndFeeAmount = '56',
  tipAndFeePercent = '57',
  nation = '58',
  merchantName = '59',
  city = '60',
  zipCode = '61',
  addtionalData = '62',
  crc = '63'
}

enum ProviderFieldID {
  guid = '00',
  data = '01',
  service = '02'
}

enum VietQRService {
  byAccountNumber = 'QRIBFTTA', // Service for quick transfer NAPAS247 to Account
  byCardNumber = 'QRIBFTTC' // Service for quick transfer NAPAS247 to Card
}

enum VietQRConsumerFieldID {
  bankBin = '00',
  bankNumber = '01'
}

enum AdditionalDataID {
  billNumber = '01', // Bill number
  mobileNumber = '02', // Phone number
  storeLabel = '03', // Store code
  loyaltyNumber = '04', // Loyalty customer code
  referenceLabel = '05', // Reference code
  customerLabel = '06', // Customer code
  terminalLabel = '07', // Terminal code
  purposeOfTransaction = '08', // Transaction purpose
  addtionalConsumerDataRequest = '09' // Additional customer data request
}

class Provider {
  fieldID: string;
  name: string;
  guid: string;
  service: string;

  constructor({
    fieldID,
    name,
    guid,
    service
  }: {
    fieldID: string;
    name: string;
    guid: string;
    service: string;
  }) {
    this.fieldID = fieldID;
    this.name = name;
    this.guid = guid;
    this.service = service;
  }
}

class AdditionalDataModel {
  billNumber?: string;
  mobileNumber?: string;
  store?: string;
  loyaltyNumber?: string;
  reference?: string;
  customerLabel?: string;
  terminal?: string;
  purpose?: string;
  dataRequest?: string;
  content?: string;

  constructor({
    billNumber,
    mobileNumber,
    store,
    loyaltyNumber,
    reference,
    customerLabel,
    terminal,
    purpose,
    dataRequest,
    content
  }: {
    billNumber?: string;
    mobileNumber?: string;
    store?: string;
    loyaltyNumber?: string;
    reference?: string;
    customerLabel?: string;
    terminal?: string;
    purpose?: string;
    dataRequest?: string;
    content?: string;
  } = {}) {
    this.billNumber = billNumber;
    this.mobileNumber = mobileNumber;
    this.store = store;
    this.loyaltyNumber = loyaltyNumber;
    this.reference = reference;
    this.customerLabel = customerLabel;
    this.terminal = terminal;
    this.purpose = purpose;
    this.dataRequest = dataRequest;
    this.content = content;
  }
}

class Consumer {
  bankBin: string;
  bankNumber: string;

  constructor({
    bankBin,
    bankNumber
  }: {
    bankBin: string;
    bankNumber: string;
  }) {
    this.bankBin = bankBin;
    this.bankNumber = bankNumber;
  }
}

class Merchant {
  id: string;
  name: string;

  constructor({
    id,
    name
  }: {
    id: string;
    name: string;
  }) {
    this.id = id;
    this.name = name;
  }
}

export {
  FieldID,
  ProviderFieldID,
  VietQRService,
  VietQRConsumerFieldID,
  AdditionalDataID,
  Provider,
  AdditionalDataModel,
  Consumer,
  Merchant
};