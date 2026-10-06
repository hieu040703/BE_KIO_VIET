import { container } from "@/modules/container";
import { TimeKeepingConfirmRepository, TimeKeepingWithEmployee } from "../timeKeepingConfirm.repository";
import { TIME_KEEPING_CONFIRM_TYPES } from "../timeKeepingConfirm.types";
import { exportHtml } from "./exportHtml";
import dayjs from "dayjs";
import { config } from "@/shared/config/env";
import fs from "fs";
import path from "path";

const getPdfFileName = (employeeName: string) => {
  const safeEmployeeName = employeeName.replace(/[\\/:*?"<>|]/g, "-").trim();
  return `BangChamCong-${safeEmployeeName}-${dayjs().format("DDMMYYYY")}.pdf`;
};

const getPdfBuffer = async (
  item: TimeKeepingWithEmployee,
  api: string,
  pdfFileName: string,
): Promise<Buffer | null> => {
  const dataHtml = await exportHtml(item);

  const requestBody = {
    content: dataHtml,
    fileName: pdfFileName,
    format: "A4",
    printBackground: true,
    landscape: false,
    receiveType: "blob",
  };

  const response = await fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[exportTKCPdf] Failed for ${item.employee.name}: ${response.status} - ${errorText}`);
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/pdf")) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[exportTKCPdf] Blob PDF received for ${item.employee.name}, size: ${buffer.length} bytes`);
    return buffer;
  }

  const json = (await response.json()) as { data?: { base64?: string; url?: string } };
  console.log(`[exportTKCPdf] JSON response for ${item.employee.name}:`, JSON.stringify(json).substring(0, 200));

  if (json?.data?.base64) {
    return Buffer.from(json.data.base64, "base64");
  }

  if (json?.data?.url) {
    const fileUrl = json.data.url;
    const baseUrl = api.replace(/\/v1\/tools\/generate-pdf$/, "");
    const fullUrl = fileUrl.startsWith("http") ? fileUrl : `${baseUrl}/${fileUrl}`;

    const fileResponse = await fetch(fullUrl);
    if (!fileResponse.ok) {
      console.error(`[exportTKCPdf] Failed to download PDF file for ${item.employee.name}: ${fullUrl}`);
      return null;
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  console.error(`[exportTKCPdf] Unexpected JSON response for ${item.employee.name}:`, json);
  return null;
};

export const exportTimeKeepingPfd = async (data: string[]) => {
  const timeKeepingConfirmRepo = container.get<TimeKeepingConfirmRepository>(
    TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository,
  );

  const dataTimeKeepingPdf: TimeKeepingWithEmployee[] = await Promise.all(
    data.map(async (item) => {
      return (await timeKeepingConfirmRepo.findByTKCId(item)) as TimeKeepingWithEmployee;
    }),
  );

  if (!dataTimeKeepingPdf.length) {
    throw new Error("Không tìm thấy dữ liệu chấm công để xuất PDF");
  }

  const api = config.API_PDF_TOOL;
  console.log("[exportTKCPdf] API_PDF_TOOL:", api);
  console.log("[exportTKCPdf] Số lượng bản ghi:", dataTimeKeepingPdf.length);

  if (dataTimeKeepingPdf.length === 1) {
    const item = dataTimeKeepingPdf[0];
    const pdfFileName = getPdfFileName(item.employee.name);
    const pdfPath = `uploads/temp/${pdfFileName}`;
    const pdfBuffer = await getPdfBuffer(item, api, pdfFileName);

    if (!pdfBuffer) {
      throw new Error("Không thể tạo file PDF. Vui lòng kiểm tra lại API_PDF_TOOL.");
    }

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`[exportTKCPdf] PDF created: ${pdfPath}, size: ${pdfBuffer.length} bytes`);

    return pdfPath;
  }

  const zipPath = `uploads/temp/BangChamCong_${dayjs().format("DDMMYYYY")}.zip`;
  const zip = require("adm-zip");
  const zipFile = new zip();

  //? gọi API để tạo file PDF từ HTML sau đó nén vào zipFile và trả về đường dẫn zip
  for (const item of dataTimeKeepingPdf) {
    const pdfFileName = getPdfFileName(item.employee.name);

    try {
      const pdfBuffer = await getPdfBuffer(item, api, pdfFileName);
      if (!pdfBuffer) {
        continue;
      }

      zipFile.addFile(pdfFileName, pdfBuffer);
    } catch (error) {
      console.error(`[exportTKCPdf] Error processing ${item.employee.name}:`, error);
    }
  }

  if (zipFile.getEntries().length === 0) {
    throw new Error("Không thể tạo file PDF nào. Vui lòng kiểm tra lại API_PDF_TOOL.");
  }

  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  zipFile.writeZip(zipPath);
  console.log(`[exportTKCPdf] Zip created: ${zipPath}, entries: ${zipFile.getEntries().length}`);

  return zipPath;
};
