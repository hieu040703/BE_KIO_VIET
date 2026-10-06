import fs from "fs/promises";
import os from "os";
import path from "path";
import sharp from "sharp";
import { FileService } from "../file.service";
import { FileTypeEnum } from "@/shared/constants/constance";

describe("FileService.getPreview", () => {
  it("returns a JPEG preview without changing the stored source file", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "thienbao-file-preview-"));
    const sourcePath = path.join(tempDir, "source.png");
    const source = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: { r: 20, g: 120, b: 220 },
      },
    })
      .png()
      .toBuffer();
    await fs.writeFile(sourcePath, source);

    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: "file-id",
        type: FileTypeEnum.IMAGE,
        originalName: "source.png",
        path: sourcePath,
      }),
    };
    const service = new FileService(repository as any);

    const result = await service.getPreview("file-id");
    const previewMetadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe("image/jpeg");
    expect(previewMetadata.format).toBe("jpeg");
    await expect(fs.readFile(sourcePath)).resolves.toEqual(source);

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
