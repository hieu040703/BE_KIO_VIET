/**
 * Utility functions for filename normalization
 */
export class FilenameUtils {
  /**
   * Chuẩn hóa tên file tiếng Việt
   * @param filename - Tên file gốc
   * @returns Tên file đã được chuẩn hóa
   */
  static normalizeVietnameseFilename(filename: string): string {
    // Bảng mapping các ký tự tiếng Việt sang không dấu
    const vietnameseMap: { [key: string]: string } = {
      à: "a",
      á: "a",
      ạ: "a",
      ả: "a",
      ã: "a",
      â: "a",
      ầ: "a",
      ấ: "a",
      ậ: "a",
      ẩ: "a",
      ẫ: "a",
      ă: "a",
      ằ: "a",
      ắ: "a",
      ặ: "a",
      ẳ: "a",
      ẵ: "a",
      è: "e",
      é: "e",
      ẹ: "e",
      ẻ: "e",
      ẽ: "e",
      ê: "e",
      ề: "e",
      ế: "e",
      ệ: "e",
      ể: "e",
      ễ: "e",
      ì: "i",
      í: "i",
      ị: "i",
      ỉ: "i",
      ĩ: "i",
      ò: "o",
      ó: "o",
      ọ: "o",
      ỏ: "o",
      õ: "o",
      ô: "o",
      ồ: "o",
      ố: "o",
      ộ: "o",
      ổ: "o",
      ỗ: "o",
      ơ: "o",
      ờ: "o",
      ớ: "o",
      ợ: "o",
      ở: "o",
      ỡ: "o",
      ù: "u",
      ú: "u",
      ụ: "u",
      ủ: "u",
      ũ: "u",
      ư: "u",
      ừ: "u",
      ứ: "u",
      ự: "u",
      ử: "u",
      ữ: "u",
      ỳ: "y",
      ý: "y",
      ỵ: "y",
      ỷ: "y",
      ỹ: "y",
      đ: "d",
      // Uppercase
      À: "A",
      Á: "A",
      Ạ: "A",
      Ả: "A",
      Ã: "A",
      Â: "A",
      Ầ: "A",
      Ấ: "A",
      Ậ: "A",
      Ẩ: "A",
      Ẫ: "A",
      Ă: "A",
      Ằ: "A",
      Ắ: "A",
      Ặ: "A",
      Ẳ: "A",
      Ẵ: "A",
      È: "E",
      É: "E",
      Ẹ: "E",
      Ẻ: "E",
      Ẽ: "E",
      Ê: "E",
      Ề: "E",
      Ế: "E",
      Ệ: "E",
      Ể: "E",
      Ễ: "E",
      Ì: "I",
      Í: "I",
      Ị: "I",
      Ỉ: "I",
      Ĩ: "I",
      Ò: "O",
      Ó: "O",
      Ọ: "O",
      Ỏ: "O",
      Õ: "O",
      Ô: "O",
      Ồ: "O",
      Ố: "O",
      Ộ: "O",
      Ổ: "O",
      Ỗ: "O",
      Ơ: "O",
      Ờ: "O",
      Ớ: "O",
      Ợ: "O",
      Ở: "O",
      Ỡ: "O",
      Ù: "U",
      Ú: "U",
      Ụ: "U",
      Ủ: "U",
      Ũ: "U",
      Ư: "U",
      Ừ: "U",
      Ứ: "U",
      Ự: "U",
      Ử: "U",
      Ữ: "U",
      Ỳ: "Y",
      Ý: "Y",
      Ỵ: "Y",
      Ỷ: "Y",
      Ỹ: "Y",
      Đ: "D",
    };

    // Thay thế từng ký tự tiếng Việt
    let normalized = filename;
    for (const [vietnamese, latin] of Object.entries(vietnameseMap)) {
      normalized = normalized.replace(new RegExp(vietnamese, "g"), latin);
    }

    // Xóa các ký tự đặc biệt khác và chuẩn hóa
    normalized = normalized
      .replace(/[^a-zA-Z0-9.\-_\s]/g, "") // Chỉ giữ lại chữ, số, dấu chấm, gạch ngang, gạch dưới và space
      .replace(/\s+/g, "-") // Thay space bằng dấu gạch ngang
      .replace(/-+/g, "-") // Thay nhiều dấu gạch ngang liên tiếp bằng 1 dấu
      .replace(/^-|-$/g, ""); // Xóa dấu gạch ngang ở đầu và cuối

    return normalized;
  }

  /**
   * Tạo tên file unique với timestamp
   * @param originalFilename - Tên file gốc
   * @returns Tên file unique đã chuẩn hóa
   */
  static generateUniqueFilename(originalFilename: string): string {
    const extension = originalFilename.split(".").pop() || "";
    const nameWithoutExt = originalFilename.split(".").slice(0, -1).join(".");

    // const normalizedName = this.normalizeVietnameseFilename(nameWithoutExt);
    const timestamp = Date.now();

    return `${nameWithoutExt}-${timestamp}.${extension.toLocaleUpperCase()}`;
  }

  /**
   * Test function để kiểm tra
   */
  static test() {
    const testCases = [
      "tải xuống (9).jpg",
      "Hướng dẫn sử dụng.pdf",
      "Báo cáo tháng 12.docx",
      "Ảnh đại diện.png",
      "File có dấu tiếng việt.txt",
    ];

    console.log("=== Test Filename Normalization ===");
    testCases.forEach((filename) => {
      const normalized = this.normalizeVietnameseFilename(filename);
      const unique = this.generateUniqueFilename(filename);
      console.log(`Original: ${filename}`);
      console.log(`Normalized: ${normalized}`);
      console.log(`Unique: ${unique}`);
      console.log("---");
    });
  }
}

// FilenameUtils.test();
