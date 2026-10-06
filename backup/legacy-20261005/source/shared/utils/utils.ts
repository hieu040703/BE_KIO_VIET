import dayjs from "dayjs";
import { ErrorsMessages } from "../constants/errors";
import { Order } from "@/database/models/Order";

export class Utils {
  static ParseFloat(value: any): number {
    const parsedValue = parseFloat(value.toFixed(2));
    return parsedValue;
  }

  static ResponseError(
    field: string,
    message: keyof typeof ErrorsMessages,
    key?: string,
  ): { message: string; errors: string[] } {
    const errorMessage = key ? `${field}.${message}.${key}` : `${field}.${message}`;
    return {
      message: errorMessage,
      errors: [errorMessage],
    };
  }

  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === "string" && value.trim() === "") {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    if (typeof value === "object" && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  }

  // chuyển đổi tiếng Việt có dấu sang không dấu
  static convertToUnSign(str: string): string {
    const unSignMap: { [key: string]: string } = {
      a: "á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ",
      e: "é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ",
      i: "í|ì|ỉ|ĩ|ị",
      o: "ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ",
      u: "ú|ù|ủ|ũ|ụ|ứ",
      y: "ý |ỳ |ỷ |ỹ |ỵ",
      d: "đ",
    };
    const regex = new RegExp(Object.values(unSignMap).join("|"), "g");
    return str
      .toLowerCase()
      .replace(regex, (match) => {
        for (const key in unSignMap) {
          if (unSignMap[key].includes(match)) {
            return key;
          }
        }
        return match; // fallback if no match found
      })
      .replace(/[^a-z0-9\s]/g, "") // remove special characters
      .replace(/\s+/g, " ") // replace multiple spaces with a single space
      .trim(); // trim leading and trailing spaces
  }

  // chuyển đổi tiếng Việt có dấu sang không dấu và thay khoảng trắng bằng dấu '_'
  static convertToUnSignWithUnderscore(str: string, char: string): string {
    return this.convertToUnSign(str).replace(/\s+/g, char);
  }

  // chuyển đổi tiếng Việt có dấu sang không dấu và đổi sang quy ước camelCase
  static convertToCamelCase(str: string): string {
    return this.convertToUnSign(str)
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return ""; // remove spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      });
  }

  //? Chuyển đổi từ camelCase sang snake_case
  static convertCamelToSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2") // insert underscore before uppercase letters
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2") // handle consecutive uppercase letters
      .toLowerCase(); // convert to lowercase
  }

  static generateRandomString(length: number = 6): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  // Encode
  static encodeToAscii(input: string): string {
    return input
      .split("")
      .map((char) => char.charCodeAt(0))
      .join("");
  }

  // Decode
  static decodeFromAscii(input: string): string {
    const pairs = input.match(/.{1,2}/g) || [];
    return pairs.map((pair) => String.fromCharCode(parseInt(pair))).join("");
  }

  // Helper to detect array of objects with id
  static isArrayOfObjectsWithId(v: any): boolean {
    return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "id" in v[0];
  }

  // validate uuid
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static formatZaloValue(value: string | null | undefined, maxLength: number): string {
    return (value || "").trim().slice(0, maxLength);
  }

  static formatZaloDate(value: Date): string {
    return dayjs(value).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss DD/MM/YYYY");
  }

  static formatZaloAddress(address: Order["address"] | null | undefined): string {
    const parts = [address?.detail, address?.ward, address?.state, address?.country]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part));

    return parts
      .filter((part, index) => index === 0 || !parts[0].includes(part))
      .join(", ")
      .slice(0, 200);
  }

  // Hàm này chuẩn hóa số điện thoại về dạng bắt đầu với "84" thay vì "+84" hoặc "0"
  static normalizeStringeePhoneNumber(phoneNumber: string): string {
    let normalized = phoneNumber.trim();

    if (normalized.startsWith("+84")) {
      normalized = "84" + normalized.slice(3);
    } else if (normalized.startsWith("0")) {
      normalized = "84" + normalized.slice(1);
    }

    return normalized;
  }

  // Hàm chuẩn hóa số điện thoại về dạng bắt đầu với "0" thay vì "+84" hoặc "84"
  static normalizePhoneNumber(phoneNumber: string): string {
    let normalized = phoneNumber.trim();

    if (normalized.startsWith("+84")) {
      normalized = "0" + normalized.slice(3);
    } else if (normalized.startsWith("84")) {
      normalized = "0" + normalized.slice(2);
    }

    return normalized;
  }
}

// console.log(Utils.convertCamelToSnakeCase("financeTransactionDetail"));

// console.log(Utils.convertToCamelCase("Hà Nội là thủ đô của Việt Nam!")); // Example usage

// const now = dayjs("2025-04-11 03:53:06.248000 +00:00");
// console.log(now); // Current date and time in specified
