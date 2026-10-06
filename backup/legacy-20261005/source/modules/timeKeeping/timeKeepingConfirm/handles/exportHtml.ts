import dayjs from "dayjs";
import { TimeKeepingWithEmployee } from "../timeKeepingConfirm.repository";
import { config } from "@/shared/config/env";

const formatHours = (value?: number | null) => Number(value || 0).toFixed(2);
const defaultAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="48" fill="#E5E7EB" />
    <circle cx="48" cy="36" r="18" fill="#9CA3AF" />
    <path d="M24 78c4.5-14 16.17-22 24-22s19.5 8 24 22" fill="#9CA3AF" />
  </svg>
`)}`;

const getDefaultAvatar = () => {
  return defaultAvatar;
};

const getAvatarSource = async (avatarUrl?: string | null) => {
  if (!avatarUrl) {
    return getDefaultAvatar();
  }

  try {
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      console.error(`[exportHtml] Cannot fetch avatar: ${response.status} ${avatarUrl}`);
      return getDefaultAvatar();
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
  } catch (error) {
    console.error("[exportHtml] Cannot resolve avatar:", error);
    return getDefaultAvatar();
  }
};

export const exportHtml = async (data: TimeKeepingWithEmployee) => {
  const beDomain = config.NODE_ENV === "production" ? config.BE_DOMAIN_PROD : config.BE_DOMAIN_DEV;
  const avatarUrl =
    data.employee.avatar && data.employee.avatar.length > 0
      ? `${beDomain}${data.employee.avatar[0].thumbnailUrl}`
      : null;
  const avatar = await getAvatarSource(avatarUrl);

  return `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bảng chấm công</title>
          <style>
            * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            }

            body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 20px;
            }

            .modal-overlay {
            background: #fff;
            border-radius: 8px;
            width: 100%;
            max-width: 1400px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            }

            /* Header */
            .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
            }

            .modal-header h2 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            }

            .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            }

            .btn-confirm {
            background: #1a73e8;
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
            }

            .btn-confirm:hover {
            background: #1557b0;
            }

            .btn-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            }

            .btn-close:hover {
            color: #1f2937;
            }

            /* Employee Info */
            .employee-info {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 24px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            }

            .employee-left {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            }

            .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            }

            .avatar svg {
            width: 28px;
            height: 28px;
            fill: #9ca3af;
            }

            .employee-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            }

            .employee-code {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 2px;
            }

            .badge-probation {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #f59e0b;
            font-weight: 500;
            }

            .badge-probation::before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f59e0b;
            }

            /* Content */
            .modal-content {
            display: block;
            gap: 20px;
            padding: 24px;
            }

            .content-left {
            flex: 1;
            min-width: 0;
            padding-top: 10px;
            }

            .content-right {
            width: 100%;
            /* flex-shrink: 0; */
            }

            /* Tables */
            .section-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
            }

            .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            padding: 16px 16px 12px;
            }

            table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            }

            thead th {
            background: #fff;
            color: #6b7280;
            font-weight: 500;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            white-space: nowrap;
            }

            thead th:first-child {
            width: 36px;
            text-align: center;
            }

            tbody td {
            padding: 10px 12px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
            }

            tbody td:first-child {
            text-align: center;
            }

            .row-summary {
            background: #fafafa;
            font-weight: 600;
            }

            .row-summary td {
            border-bottom: 2px solid #e5e7eb;
            }

            input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #1a73e8;
            cursor: pointer;
            }

            .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            }

            .status-unpaid {
            background: #fef3c7;
            color: #d97706;
            }

            /* Right Panel - Net Salary */
            .net-salary-card {
            background: linear-gradient(135deg, #1a56db, #1e40af);
            color: #fff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            }

            .net-salary-label {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 4px;
            text-align: center;
            }

            .net-salary-amount {
            font-size: 30px;
            font-weight: 700;
            margin-bottom: 16px;
            text-align: center;
            }

            .net-salary-stats {
            display: flex;
            gap: 0;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-top: 14px;
            }

            .stat-item {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            }

            .stat-item:first-child {
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            }

            .stat-icon {
            width: 20px;
            height: 20px;
            opacity: 0.8;
            }

            .stat-label {
            font-size: 12px;
            opacity: 0.8;
            }

            .stat-value {
            font-size: 15px;
            font-weight: 600;
            }

            /* Salary Detail */
            .salary-detail-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            }

            .salary-detail-title {
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            }

            .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            }

            .detail-row.bordered {
            border-top: 1px solid #f3f4f6;
            padding-top: 12px;
            margin-top: 4px;
            }

            .detail-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #374151;
            }

            .detail-label .icon {
            font-size: 16px;
            }

            .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            }

            .detail-value.blue {
            color: #1a73e8;
            }

            .detail-value.red {
            color: #ef4444;
            }

            .detail-row.total {
            border-top: 1px solid #e5e7eb;
            padding-top: 14px;
            margin-top: 8px;
            }

            .detail-row.total .detail-label {
            font-weight: 600;
            color: #1f2937;
            }

            .detail-row.total .detail-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            }

            /* Responsive */
            @media (max-width: 1024px) {
            .modal-content {
                flex-direction: column;
            }
            .content-right {
                width: 100%;
            }
            }
        </style>
        </head>
        <body>
        <div class="modal-overlay">
            <!-- Header -->
            <div class="modal-header">
            <h2>Bảng chấm công</h2>
            </div>

            <!-- Employee Info -->
            <div class="employee-info">
            <div class="employee-left">
                <div class="avatar">
              <img src="${avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div>
                <div class="employee-name">${data.employee.name}</div>
                <div class="employee-code">${data.employee.code}</div>
                </div>
            </div>
            </div>

            <!-- Content -->
            <div class="modal-content">

            <!-- Right: Summary -->
            <div class="content-right">
                <!-- Net Salary Card -->
                <div class="net-salary-card">
                <div class="net-salary-label">Lương thực nhận</div>
                <div class="net-salary-amount">${data.totalRealSalary.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                <div class="net-salary-stats">
                    <div class="stat-item">
                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <div>
                        <div class="stat-label">Tổng giờ</div>
                      <div class="stat-value">${formatHours(data.totalHours)}h</div>
                    </div>
                    </div>
                    <div class="stat-item">
                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div>
                        <div class="stat-label">Tổng ngày công</div>
                        <div class="stat-value">${data.totalDayWorked} ngày</div>
                    </div>
                    </div>
                </div>
                </div>

                <!-- Salary Detail -->
                <div class="salary-detail-card">
                <div class="salary-detail-title">Chi tiết lương</div>

                <div class="detail-row">
                    <span class="detail-label">
                    <span class="icon">💵</span> Tổng lương
                    </span>
                    <span class="detail-value">${data.totalSalary.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                    <span class="icon">💸</span> Ứng lương
                    </span>
                    <span class="detail-value red">${data.totalAdvance.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                    <span class="icon">🏆</span> Thưởng
                    </span>
                    <span class="detail-value green">${data.totalBonus.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                    <span class="icon">⛔</span> Phạt
                    </span>
                    <span class="detail-value red">${data.totalPenalty.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row bordered">
                    <span class="detail-label">
                    <span class="icon">💰</span> Ký quỹ
                    </span>
                    <span class="detail-value ${data.totalMargin > 0 ? "blue" : "red"}">${data.totalMargin.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                    <span class="icon">👔</span> Đồng phục
                    </span>
                    <span class="detail-value ${data.totalUniform > 0 ? "blue" : "red"}">${data.totalUniform.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>

                <div class="detail-row total">
                    <span class="detail-label">Thực nhận</span>
                    <span class="detail-value">${data.totalRealSalary.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </div>
                </div>
            </div>

            <!-- Left: Tables -->
            <div class="content-left">
                <!-- Bảng lương -->
                <div class="section-card">
                <div class="section-title">Bảng lương</div>
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Ngày</th>
                        <th>Giờ bắt đầu</th>
                        <th>Giờ kết thúc</th>
                        <th>Tổng giờ (h)</th>
                        <th>Lương</th>
                        <th>Ghi chú</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="row-summary">
                        <td></td>
                        <td><strong>Tổng</strong></td>
                        <td></td>
                        <td></td>
                      <td><strong>${formatHours(data.totalHours)}</strong></td>
                        <td><strong>${data.totalSalary.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</strong></td>
                        <td></td>
                        <td></td>
                    </tr>
                    ${data.timeKeepings
                      .map((tk, index) => {
                        return `<tr>
                        <td>${index + 1}</td>
                        <td>${dayjs(tk.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                        <td>${tk.startTime}</td>
                        <td>${tk.endTime}</td>
                        <td>${formatHours(tk.totalHours)}</td>
                        <td>${tk.salary?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                        <td>${tk.note || ""}</td>
                        </tr>`;
                      })
                      .join("")}
                    </tbody>
                </table>
                </div>

                ${
                  data.advanceDetails.length > 0
                    ? `
                      <!-- Ứng lương -->
                        <div class="section-card">
                        <div class="section-title">Ứng lương</div>
                        <table>
                            <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ngày</th>
                                <th>Số tiền</th>
                                <th>Ghi chú</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${data.advanceDetails
                              .map((item, index) => {
                                return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${dayjs(item.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                                    <td>${item.otherAmount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                    <td>${item.note || ""}</td>
                                </tr>
                              `;
                              })
                              .join("")}
                            </tbody>
                        </table>
                      `
                    : ""
                }
                ${
                  data.marginDetails.length > 0
                    ? `
                    <!-- Ký quỹ -->
                    <div class="section-card">
                    <div class="section-title">Ký quỹ</div>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Số tiền</th>
                            <th>Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${data.marginDetails
                          .map((item, index) => {
                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${dayjs(item.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                                <td>${item.otherAmount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                <td>${item.note || ""}</td>
                            </tr>
                            `;
                          })
                          .join("")}
                        </tbody>
                    </table>
                    `
                    : ""
                }
                ${
                  data.penaltyDetails.length > 0
                    ? `
                    <!-- Phạt -->
                    <div class="section-card">
                    <div class="section-title">Phạt</div>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Số tiền</th>
                            <th>Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${data.penaltyDetails
                          .map((item, index) => {
                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${dayjs(item.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                                <td>${item.otherAmount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                <td>${item.note || ""}</td>
                            </tr>
                            `;
                          })
                          .join("")}
                        </tbody>
                    </table>
                `
                    : ""
                }
                ${
                  data.uniformDetails.length > 0
                    ? `
                    <!-- Đồng phục -->
                    <div class="section-card">
                    <div class="section-title">Đồng phục</div>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Số tiền</th>
                            <th>Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${data.uniformDetails
                          .map((item, index) => {
                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${dayjs(item.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                                <td>${item.otherAmount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                <td>${item.note || ""}</td>
                            </tr>
                            `;
                          })
                          .join("")}
                        </tbody>
                    </table>
                `
                    : ""
                }
                 ${
                   data.bonusDetails.length > 0
                     ? `
                    <!-- Thưởng -->
                    <div class="section-card">
                    <div class="section-title">Thưởng</div>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Số tiền</th>
                            <th>Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${data.bonusDetails
                          .map((item, index) => {
                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${dayjs(item.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</td>
                                <td>${item.otherAmount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                <td>${item.note || ""}</td>
                            </tr>
                            `;
                          })
                          .join("")}
                        </tbody>
                    </table>
                `
                     : ""
                 }
                </div>
            </div>


            </div>
        </div>
        </body>
        </html>

    `;
};
