import { ILike, Raw } from "typeorm";

export class SearchUtils {
  /**
   * Tìm kiếm thông minh với pg_trgm và unaccent
   * @param field - Tên field
   * @param keyword - Từ khóa
   * @param threshold - Ngưỡng similarity (0-1)
   */
  static createSmartSearch(field: string, keyword: string, threshold: number = 0.3) {
    return {
      [field]: Raw(
        (alias) => `
          (
            unaccent(${alias}) ILIKE unaccent(:exactKeyword) OR 
            unaccent(${alias}) % unaccent(:fuzzyKeyword) OR
            similarity(unaccent(${alias}), unaccent(:similarityKeyword)) > :threshold
          )
        `,
        {
          exactKeyword: `%${keyword}%`,
          fuzzyKeyword: keyword,
          similarityKeyword: keyword,
          threshold: threshold,
        }
      ),
    };
  }

  /**
   * Tìm kiếm với sắp xếp theo độ liên quan
   */
  static createRelevanceSearch(field: string, keyword: string) {
    return {
      [field]: Raw(
        (alias) => `
        CASE 
          WHEN unaccent(${alias}) ILIKE unaccent(:exactMatch) THEN 1.0
          WHEN unaccent(${alias}) ILIKE unaccent(:startsWithMatch) THEN 0.9
          WHEN unaccent(${alias}) ILIKE unaccent(:containsMatch) THEN 0.8
          ELSE similarity(unaccent(${alias}), unaccent(:similarityMatch))
        END > 0.8
      `,
        {
          exactMatch: keyword,
          startsWithMatch: `${keyword}%`,
          containsMatch: `%${keyword}%`,
          similarityMatch: keyword,
        }
      ),
    };
  }

  /**
   * normal search
   * @param field - Tên field
   * @param keyword - Từ khóa
   */
  static createNormalSearch(field: string, keyword: string) {
    return {
      [field]: ILike(`%${keyword}%`),
    };
  }
}
