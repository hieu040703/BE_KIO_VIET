import { Order } from "@/database/models/Order";
import dayjs from "dayjs";

export const exportBillHandle = (order: Order) => {
  console.log(order.note);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa Đơn Bán Hàng</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', sans-serif;
                padding: 20px;
                background-color: #f5f5f5;
            }

            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 40px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 3px solid #333;
                padding-bottom: 20px;
            }

            .header h1 {
                color: #333;
                font-size: 28px;
                margin-bottom: 10px;
            }

            .company-info {
                margin-bottom: 10px;
            }

            .company-info h2 {
                color: #2c3e50;
                font-size: 20px;
                margin-bottom: 10px;
            }

            .company-info p {
                color: #666;
                line-height: 1.6;
            }

            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }

            .invoice-details .left,
            .invoice-details .right {
                width: 48%;
            }

            .invoice-details h3 {
                color: #2c3e50;
                font-size: 16px;
                margin-bottom: 10px;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5px;
            }

            .invoice-details p {
                color: #666;
                line-height: 1.8;
                font-size: 14px;
            }

            .invoice-details strong {
                color: #333;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }

            table thead {
                background-color: #3498db;
                color: white;
            }

            table th {
                padding: 12px;
                text-align: left;
                font-weight: bold;
            }

            table td {
                padding: 10px 8px;
                border-bottom: 1px solid #ddd;
            }

            table tbody tr:hover {
                background-color: #f9f9f9;
            }

            .text-right {
                text-align: right;
            }

            .text-center {
                text-align: center;
            }

            .totals {
                margin-left: auto;
                width: 350px;
            }

            .totals table {
                margin-bottom: 0;
            }

            .totals td {
                padding: 6px 8px;
            }

            .totals .grand-total {
                color: black;
                font-weight: bold;
                font-size: 16px;
            }

            .footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #ddd;
            }

            .signatures {
                display: flex;
                justify-content: space-around;
                margin-top: 40px;
            }

            .signature-box {
                text-align: center;
                width: 200px;
            }

            .signature-box .sbname {
                font-weight: bold;
                color: #333;
            }

            .signature-line {
                border-top: 1px solid #333;
                padding-top: 5px;
                font-style: italic;
                color: #666;
                font-size: 14px;
            }

            .notes {
                margin-top: 20px;
                padding: 15px;
                background-color: #fff9e6;
                border-left: 4px solid #f39c12;
            }

            .notes h4 {
                color: #f39c12;
                margin-bottom: 5px;
            }

            .notes p {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
            }

            @media print {
                body {
                    background-color: white;
                    padding: 0;
                }

                .invoice-container {
                    box-shadow: none;
                    padding: 20px;
                }

                .no-print {
                    display: none;
                }
            }

            .print-button {
                background-color: #3498db;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-bottom: 20px;
            }

            .print-button:hover {
                background-color: #2980b9;
            }
        </style>
    </head>
    <body>
        <div class="no-print">
            <button class="print-button" onclick="window.print()">🖨️ In Hóa Đơn</button>
        </div>

        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <h1>BÁO GIÁ DỊCH VỤ</h1>
            </div>

            <!-- Company Info -->
            <div class="company-info">
                <h2>CÔNG TY TNHH PHÁT TRIỂN DỊCH VỤ VẬN TẢI THIÊN BẢO</h2>
                <p><strong>Địa chỉ:</strong> Số 28 Tây Trà, Phường Hoàng Mai, TP Hà Nội, Việt Nam</p>
                <p><strong>Điện thoại:</strong> 0866146497 | <strong>Email:</strong> tranthienbao15082016@gmail.com</p>
                <p><strong>Mã số thuế:</strong> 0110133690</p>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
                <div class="left">
                    <h3>Thông Tin Hóa Đơn</h3>
                    <p><strong>Số hóa đơn:</strong> ${order.code || ""}</p>
                    <p><strong>Ngày lập:</strong> ${order.timeAt ? dayjs(order.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : ""}</p>
                    <p><strong>Hình thức thanh toán:</strong> chuyển khoản / tiền mặt</p>
                </div>
                <div class="right">
                    <h3>Thông Tin Khách Hàng</h3>
                    <p><strong>Tên khách hàng:</strong> ${order.customer.name}</p>
                    <p><strong>Địa chỉ:</strong> ${order.customer.address?.detail || ""} ${order.customer.address?.ward || ""} ${order.customer.address?.state || ""}</p>
                    <p><strong>Số điện thoại:</strong> ${order.customerPhone || order.customer.phone}</p>
                    <p><strong>Mã số thuế:</strong> ${order.customer.taxCode || ""}</p>
                </div>
            </div>

            <!-- Items Table -->
            <table>
                <thead>
                    <tr>
                        <th class="text-center">STT</th>
                        <th>Tên Hàng Hóa / Dịch Vụ</th>
                        <th class="text-center">ĐVT</th>
                        <th class="text-right">Số Lượng</th>
                        <th class="text-right">Đơn Giá</th>
                        <th class="text-right">Tổng Giờ</th>
                        <th class="text-right">Thành Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.details
                      .map(
                        (detail, index) => `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${detail.name}</td>
                        <td class="text-center">${detail.unit}</td>
                        <td class="text-right">${detail.quantity}</td>
                        <td class="text-right">${detail.price.toLocaleString()}</td>
                        <td class="text-right">${detail.totalHours || ""}</td>
                        <td class="text-right">${(detail.quantity * detail.price).toLocaleString()}</td>
                    </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals">
                <table>
                    <tr>
                        <td>Tạm tính:</td>
                        <td class="text-right">${order.preVatAmount!.toLocaleString()} đ</td>
                    </tr>
                    <tr>
                        <td>Giảm giá (${order.discountPercent ?? "0"}%):</td>
                        <td class="text-right">${order.discountAmount ? order.discountAmount.toLocaleString() : "0"} đ</td>
                    </tr>
                    <tr>
                        <td>Thuế VAT (${order.vat ?? "0"}%):</td>
                        <td class="text-right">${order.vatAmount ? order.vatAmount.toLocaleString() : "0"} đ</td>
                    </tr>
                    <tr class="grand-total">
                        <td><strong>TỔNG CỘNG:</strong></td>
                        <td class="text-right"><strong>${order.amount.toLocaleString()} đ</strong></td>
                    </tr>
                </table>
            </div>

            <!-- Notes -->
            <div class="notes">
                <h4>Ghi Chú:</h4>
                ${order.note ? `${order.note}` : ""}
            </div>

            <!-- Signatures -->
            <div class="signatures">
                <div class="signature-box">
                    <p class="sbname">Người Mua Hàng</p>
                    <p>(Ký và ghi rõ họ tên)</p>
                </div>
                <div class="signature-box">
                    <p class="sbname">Người Bán Hàng</p>
                    <p>(Ký và ghi rõ họ tên)</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
