import { thumbnailUtils } from "../thumbnail.utils";

describe("ThumbnailUtils HEIC support", () => {
  it("recognizes HEIC and HEIF MIME types as supported image formats", () => {
    expect(thumbnailUtils.isSupportedImageFormat("image/heic")).toBe(true);
    expect(thumbnailUtils.isSupportedImageFormat("image/heif")).toBe(true);
    expect(thumbnailUtils.isSupportedImageFormat("image/heic-sequence")).toBe(true);
  });

  it("recognizes HEIC files when the upload MIME type is missing or generic", () => {
    expect(thumbnailUtils.isHeicFile(undefined, "photo.HEIC")).toBe(true);
    expect(thumbnailUtils.isHeicFile("application/octet-stream", "photo.heif")).toBe(true);
    expect(thumbnailUtils.isHeicFile("image/jpeg", "photo.jpg")).toBe(false);
  });
});
