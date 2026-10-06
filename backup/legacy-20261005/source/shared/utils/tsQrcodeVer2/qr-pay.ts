import {
  AdditionalDataID,
  AdditionalDataModel,
  Consumer,
  FieldID,
  Merchant,
  Provider,
  ProviderFieldID,
  VietQRConsumerFieldID,
  VietQRService,
} from "./constants";
import { StringHelper } from "./string-helper";

class QrPay {
  version?: string;
  initMethod?: string;
  provider?: Provider;
  merchant?: Merchant;
  consumer?: Consumer;
  category?: string;
  currency?: string;
  amount?: string;
  tipAndFeeType?: string;
  tipAndFeeAmount?: string;
  tipAndFeePercent?: string;
  nation?: string;
  city?: string;
  zipCode?: string;
  additionalData?: AdditionalDataModel;
  crc?: string;

  constructor({
    version = "01",
    initMethod = "11",
    provider,
    merchant,
    consumer,
    category,
    currency,
    amount,
    tipAndFeeType,
    tipAndFeeAmount,
    tipAndFeePercent,
    nation,
    city,
    zipCode,
    additionalData,
    crc,
  }: {
    version?: string;
    initMethod?: string;
    provider?: Provider;
    merchant?: Merchant;
    consumer?: Consumer;
    category?: string;
    currency?: string;
    amount?: string;
    tipAndFeeType?: string;
    tipAndFeeAmount?: string;
    tipAndFeePercent?: string;
    nation?: string;
    city?: string;
    zipCode?: string;
    additionalData?: AdditionalDataModel;
    crc?: string;
  } = {}) {
    this.version = version;
    this.initMethod = initMethod;
    this.provider = provider;
    this.merchant = merchant;
    this.consumer = consumer;
    this.category = category;
    this.currency = currency;
    this.amount = amount;
    this.tipAndFeeType = tipAndFeeType;
    this.tipAndFeeAmount = tipAndFeeAmount;
    this.tipAndFeePercent = tipAndFeePercent;
    this.nation = nation;
    this.city = city;
    this.zipCode = zipCode;
    this.additionalData = additionalData;
    this.crc = crc;
  }

  /**
   * Build QR code string based on the configured parameters
   */
  build(): string {
    const version = StringHelper.genFieldData(FieldID.version, this.version);

    const initMethod = StringHelper.genFieldData(FieldID.initMethod, this.initMethod);

    const guid = StringHelper.genFieldData(ProviderFieldID.guid, this.provider?.guid);

    // Consumer data content
    let providerDataContent = "";
    const bankBin = StringHelper.genFieldData(VietQRConsumerFieldID.bankBin, this.consumer?.bankBin);

    const bankNumber = StringHelper.genFieldData(VietQRConsumerFieldID.bankNumber, this.consumer?.bankNumber);

    providerDataContent = bankBin + bankNumber;

    const provider = StringHelper.genFieldData(ProviderFieldID.data, providerDataContent);

    const service = StringHelper.genFieldData(ProviderFieldID.service, this.provider?.service);

    const providerData = StringHelper.genFieldData(this.provider?.fieldID, guid + provider + service);

    const category = StringHelper.genFieldData(FieldID.category, this.category);

    const currency = StringHelper.genFieldData(FieldID.currency, this.currency ?? "704");

    const amountStr = StringHelper.genFieldData(FieldID.amount, this.amount);

    const tipAndFeeType = StringHelper.genFieldData(FieldID.tipAndFeeType, this.tipAndFeeType);

    const tipAndFeeAmount = StringHelper.genFieldData(FieldID.tipAndFeeAmount, this.tipAndFeeAmount);

    const tipAndFeePercent = StringHelper.genFieldData(FieldID.tipAndFeePercent, this.tipAndFeePercent);

    const nation = StringHelper.genFieldData(FieldID.nation, this.nation ?? "VN");

    const merchantName = StringHelper.genFieldData(FieldID.merchantName, this.merchant?.name);

    const city = StringHelper.genFieldData(FieldID.city, this.city);

    const zipCode = StringHelper.genFieldData(FieldID.zipCode, this.zipCode);

    // Build additional data fields
    const buildNumber = StringHelper.genFieldData(AdditionalDataID.billNumber, this.additionalData?.billNumber);

    const mobileNumber = StringHelper.genFieldData(AdditionalDataID.mobileNumber, this.additionalData?.mobileNumber);

    const storeLabel = StringHelper.genFieldData(AdditionalDataID.storeLabel, this.additionalData?.store);

    const loyaltyNumber = StringHelper.genFieldData(AdditionalDataID.loyaltyNumber, this.additionalData?.loyaltyNumber);

    const reference = StringHelper.genFieldData(AdditionalDataID.referenceLabel, this.additionalData?.reference);

    const customerLabel = StringHelper.genFieldData(AdditionalDataID.customerLabel, this.additionalData?.customerLabel);

    const terminal = StringHelper.genFieldData(AdditionalDataID.terminalLabel, this.additionalData?.terminal);

    const purpose = StringHelper.genFieldData(AdditionalDataID.purposeOfTransaction, this.additionalData?.purpose);

    const dataRequest = StringHelper.genFieldData(
      AdditionalDataID.addtionalConsumerDataRequest,
      this.additionalData?.dataRequest
    );

    const additionalDataContent =
      buildNumber +
      mobileNumber +
      storeLabel +
      loyaltyNumber +
      reference +
      customerLabel +
      terminal +
      purpose +
      dataRequest;

    const additionalData = StringHelper.genFieldData(FieldID.addtionalData, additionalDataContent);

    const content = `${version}${initMethod}${providerData}${category}${currency}${amountStr}${tipAndFeeType}${tipAndFeeAmount}${tipAndFeePercent}${nation}${merchantName}${city}${zipCode}${additionalData}${FieldID.crc}04`;

    const crc = StringHelper.genCRCCode(content);
    return content + crc;
  }

  /**
   * Factory method to create a VietQR payment instance
   */
  static vietQR({
    bin,
    bankNumber,
    amount,
    service,
    purpose,
    content,
  }: {
    bin: string;
    bankNumber: string;
    amount?: string;
    service?: VietQRService;
    purpose?: string;
    content?: string;
  }): QrPay {
    const provider = new Provider({
      fieldID: FieldID.vietqr,
      name: "VIETQR",
      guid: "A000000727",
      service: service ?? VietQRService.byAccountNumber,
    });

    const consumer = new Consumer({
      bankBin: bin,
      bankNumber: bankNumber,
    });

    return new QrPay({
      initMethod: amount == null ? "12" : "11",
      provider: provider,
      consumer: consumer,
      amount: amount,
      additionalData: new AdditionalDataModel({
        purpose: purpose,
        content: content,
      }),
    });
  }
}

export { QrPay };

const qrPay = QrPay.vietQR({
  bin: "970422",
  bankNumber: "0888382699",
  amount: "1000000",
  service: VietQRService.byAccountNumber,
  purpose: "0JB0IG2333",
});
// console.log(qrPay.build());
