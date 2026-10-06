/**
 * File validation limits for Excel imports
 * Adjust these values based on your server capacity
 */

export const FILE_VALIDATION_LIMITS = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    DEFAULT: 50 * 1024 * 1024, // 50MB - Default cho hầu hết file
    SMALL: 20 * 1024 * 1024, // 20MB - Cho file đơn giản
    LARGE: 100 * 1024 * 1024, // 100MB - Cho file phức tạp (cần tăng heap)
  },

  // Row count limits
  MAX_ROWS: {
    DEFAULT: 50000, // 50k rows - Default
    SMALL: 20000, // 20k rows - Cho xử lý phức tạp
    LARGE: 100000, // 100k rows - Cho xử lý đơn giản
  },

  // File size to row ratio limits
  MAX_MB_PER_1000_ROWS: {
    DEFAULT: 5, // 5MB per 1000 rows - Normal file
    STRICT: 3, // 3MB per 1000 rows - Strict mode
    RELAXED: 10, // 10MB per 1000 rows - Allow some media
  },

  // Memory requirements
  MEMORY: {
    // Estimated memory multiplier
    FILE_SIZE_MULTIPLIER: 10, // File size * 10 = estimated memory usage
    ROW_SIZE_KB: 0.5, // Each row ~0.5KB in memory

    // Minimum free memory buffer (multiplier)
    SAFETY_BUFFER: 1.5, // Cần 1.5x memory so với yêu cầu
  },

  // Recommended limits based on Node heap size
  RECOMMENDED_LIMITS: {
    // Heap 2GB
    HEAP_2GB: {
      maxFileSize: 20 * 1024 * 1024, // 20MB
      maxRows: 20000,
    },
    // Heap 4GB
    HEAP_4GB: {
      maxFileSize: 40 * 1024 * 1024, // 40MB
      maxRows: 40000,
    },
    // Heap 8GB (current)
    HEAP_8GB: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxRows: 50000,
    },
    // Heap 16GB
    HEAP_16GB: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxRows: 100000,
    },
  },
} as const;

/**
 * Get recommended limits based on current heap size
 */
export function getRecommendedLimits() {
  const heapSizeMB = process.memoryUsage().heapTotal / (1024 * 1024);

  if (heapSizeMB < 3000) {
    return FILE_VALIDATION_LIMITS.RECOMMENDED_LIMITS.HEAP_2GB;
  } else if (heapSizeMB < 6000) {
    return FILE_VALIDATION_LIMITS.RECOMMENDED_LIMITS.HEAP_4GB;
  } else if (heapSizeMB < 12000) {
    return FILE_VALIDATION_LIMITS.RECOMMENDED_LIMITS.HEAP_8GB;
  } else {
    return FILE_VALIDATION_LIMITS.RECOMMENDED_LIMITS.HEAP_16GB;
  }
}
