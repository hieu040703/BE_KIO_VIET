import { createServer } from "http";

// Biến global để lưu trữ giá hiện tại và danh sách clients
let currentPrice = (Math.random() * 100000).toFixed(2);
const clients = new Set();

// Cập nhật giá mỗi 5 giây cho tất cả clients
setInterval(() => {
  currentPrice = (Math.random() * 100000).toFixed(2);
  const data = JSON.stringify({ price: currentPrice });

  // Gửi giá mới tới tất cả clients đang kết nối
  clients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      console.log("Lỗi khi gửi dữ liệu tới client:", error.message);
      clients.delete(client);
    }
  });

  console.log(`Đã gửi giá ${currentPrice} VND tới ${clients.size} client(s)`);
}, 5000);

const server = createServer((req, res) => {
  // Thiết lập CORS headers cho tất cả requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/price-updates") {
    // Thiết lập header cho SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Thêm client mới vào danh sách
    clients.add(res);
    console.log(`Client mới kết nối. Tổng số clients: ${clients.size}`);

    // Gửi giá hiện tại ngay lập tức cho client mới
    const initialData = JSON.stringify({ price: currentPrice });
    res.write(`data: ${initialData}\n\n`);

    // Xử lý khi client ngắt kết nối
    req.on("close", () => {
      clients.delete(res);
      console.log(`Client đã ngắt kết nối. Tổng số clients: ${clients.size}`);
      res.end();
    });

    // Xử lý lỗi connection
    res.on("error", (error) => {
      console.log("Lỗi connection:", error.message);
      clients.delete(res);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8080, () => {
  console.log("Server chạy tại http://localhost:8080");
});
