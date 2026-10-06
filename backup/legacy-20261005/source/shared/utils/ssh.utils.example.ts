import { SSHUtils, SSHConfig } from "@/shared/utils/ssh.utils";
import * as fs from "fs";

/**
 * HƯỚNG DẪN SỬ DỤNG SSH UTILS
 */

// Cấu hình SSH với password
const sshConfigWithPassword: SSHConfig = {
  host: "192.168.1.100",
  port: 22,
  username: "ubuntu",
  password: "your-password",
};

// Cấu hình SSH với private key
const sshConfigWithKey: SSHConfig = {
  host: "192.168.1.100",
  port: 22,
  username: "ubuntu",
  privateKey: fs.readFileSync("/path/to/private/key"),
  // passphrase: 'key-passphrase', // nếu private key có passphrase
};

/**
 * VÍ DỤ 1: Thực thi một lệnh đơn giản
 */
async function example1() {
  try {
    const result = await SSHUtils.executeCommand(sshConfigWithPassword, "ls -la /var/www");

    console.log("Output:", result.stdout);
    console.log("Error:", result.stderr);
    console.log("Exit code:", result.code);
  } catch (error) {
    console.error("Command failed:", error);
  }
}

/**
 * VÍ DỤ 2: Thực thi nhiều lệnh tuần tự
 */
async function example2() {
  try {
    const commands = ["cd /var/www/app", "git pull origin main", "npm install", "pm2 restart app"];

    const results = await SSHUtils.executeCommands(sshConfigWithPassword, commands);

    results.forEach((result, index) => {
      console.log(`Command ${index + 1}:`, commands[index]);
      console.log("Output:", result.stdout);
      console.log("---");
    });
  } catch (error) {
    console.error("Commands failed:", error);
  }
}

/**
 * VÍ DỤ 3: Sử dụng kết nối được giữ mở (hiệu quả hơn cho nhiều lệnh)
 */
async function example3() {
  try {
    const results = await SSHUtils.withConnection(sshConfigWithPassword, async (client) => {
      // Thực thi nhiều lệnh với cùng một kết nối
      const result1 = await SSHUtils.execWithClient(client, "pwd");
      const result2 = await SSHUtils.execWithClient(client, "whoami");
      const result3 = await SSHUtils.execWithClient(client, "df -h");

      return {
        currentDir: result1.stdout.trim(),
        user: result2.stdout.trim(),
        diskSpace: result3.stdout,
      };
    });

    console.log("Results:", results);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

/**
 * VÍ DỤ 4: Kiểm tra kết nối SSH
 */
async function example4() {
  const isConnected = await SSHUtils.testConnection(sshConfigWithPassword);
  console.log("Connection status:", isConnected ? "Success" : "Failed");
}

/**
 * VÍ DỤ 5: Upload file lên server
 */
async function example5() {
  try {
    await SSHUtils.uploadFile(sshConfigWithPassword, "/local/path/file.txt", "/remote/path/file.txt");
    console.log("File uploaded successfully");
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

/**
 * VÍ DỤ 6: Download file từ server
 */
async function example6() {
  try {
    await SSHUtils.downloadFile(sshConfigWithPassword, "/remote/path/file.txt", "/local/path/file.txt");
    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Download failed:", error);
  }
}

/**
 * VÍ DỤ 7: Deploy ứng dụng Node.js
 */
async function deployNodeApp() {
  try {
    const deployCommands = [
      "cd /var/www/my-app",
      "git pull origin main",
      "npm install --production",
      "npm run build",
      "pm2 restart my-app",
    ];

    console.log("Starting deployment...");

    const results = await SSHUtils.executeCommands(sshConfigWithPassword, deployCommands);

    results.forEach((result, index) => {
      if (result.code === 0) {
        console.log(`✓ Step ${index + 1} completed`);
      } else {
        console.error(`✗ Step ${index + 1} failed:`, result.stderr);
      }
    });

    console.log("Deployment completed!");
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

/**
 * VÍ DỤ 8: Backup database
 */
async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = `backup-${timestamp}.sql`;

    // Tạo backup trên server
    await SSHUtils.executeCommand(sshConfigWithPassword, `pg_dump -U postgres mydb > /tmp/${backupFile}`);

    // Download backup về local
    await SSHUtils.downloadFile(sshConfigWithPassword, `/tmp/${backupFile}`, `./backups/${backupFile}`);

    // Xóa file backup trên server
    await SSHUtils.executeCommand(sshConfigWithPassword, `rm /tmp/${backupFile}`);

    console.log(`Backup completed: ${backupFile}`);
  } catch (error) {
    console.error("Backup failed:", error);
  }
}

/**
 * VÍ DỤ 9: Restart services
 */
async function restartServices() {
  try {
    const services = ["nginx", "postgresql", "redis"];

    for (const service of services) {
      console.log(`Restarting ${service}...`);

      const result = await SSHUtils.executeCommand(sshConfigWithPassword, `sudo systemctl restart ${service}`);

      if (result.code === 0) {
        console.log(`✓ ${service} restarted successfully`);
      } else {
        console.error(`✗ Failed to restart ${service}:`, result.stderr);
      }
    }
  } catch (error) {
    console.error("Service restart failed:", error);
  }
}

/**
 * VÍ DỤ 10: Sử dụng trong Controller
 */
export class DeploymentController {
  async deploy(req: any, res: any) {
    try {
      // Lấy config từ env hoặc database
      const sshConfig: SSHConfig = {
        host: process.env.SERVER_HOST!,
        port: parseInt(process.env.SERVER_PORT || "22"),
        username: process.env.SERVER_USER!,
        password: process.env.SERVER_PASSWORD,
      };

      // Thực thi deployment
      const result = await SSHUtils.executeCommand(sshConfig, "cd /var/www/app && ./deploy.sh");

      res.json({
        success: result.code === 0,
        output: result.stdout,
        error: result.stderr,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

// Export các function example để test
export { example1, example2, example3, example4, example5, example6, deployNodeApp, backupDatabase, restartServices };
