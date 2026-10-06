import { Client, ConnectConfig } from "ssh2";
import logger from "./logger";

export interface SSHConfig extends ConnectConfig {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: Buffer | string;
  passphrase?: string;
}

export interface SSHCommandResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal?: string;
}

export class SSHUtils {
  private static logger = logger;

  /**
   * Thực thi một lệnh trên server thông qua SSH
   * @param config - Cấu hình SSH connection
   * @param command - Lệnh cần thực thi
   * @returns Promise với kết quả stdout, stderr, code
   */
  static async executeCommand(config: SSHConfig, command: string): Promise<SSHCommandResult> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let stdout = "";
      let stderr = "";

      conn
        .on("ready", () => {
          this.logger.info(`SSH connected to ${config.host}`);

          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            stream
              .on("close", (code: number, signal: string) => {
                this.logger.info(`Command completed with code: ${code}, signal: ${signal}`);
                conn.end();
                resolve({
                  stdout,
                  stderr,
                  code,
                  signal,
                });
              })
              .on("data", (data: Buffer) => {
                stdout += data.toString();
              })
              .stderr.on("data", (data: Buffer) => {
                stderr += data.toString();
              });
          });
        })
        .on("error", (err) => {
          this.logger.error(`SSH connection error: ${err.message}`);
          reject(err);
        })
        .connect(config);
    });
  }

  /**
   * Thực thi nhiều lệnh tuần tự trên server
   * @param config - Cấu hình SSH connection
   * @param commands - Mảng các lệnh cần thực thi
   * @returns Promise với mảng kết quả của từng lệnh
   */
  static async executeCommands(config: SSHConfig, commands: string[]): Promise<SSHCommandResult[]> {
    const results: SSHCommandResult[] = [];

    for (const command of commands) {
      try {
        const result = await this.executeCommand(config, command);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to execute command: ${command}`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Thực thi lệnh với kết nối SSH được giữ mở
   * @param config - Cấu hình SSH connection
   * @param callback - Callback function nhận client để thực thi nhiều lệnh
   */
  static async withConnection<T>(config: SSHConfig, callback: (client: Client) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn
        .on("ready", async () => {
          this.logger.info(`SSH connected to ${config.host}`);
          try {
            const result = await callback(conn);
            conn.end();
            resolve(result);
          } catch (error) {
            conn.end();
            reject(error);
          }
        })
        .on("error", (err) => {
          this.logger.error(`SSH connection error: ${err.message}`);
          reject(err);
        })
        .connect(config);
    });
  }

  /**
   * Helper để thực thi lệnh với client đã có
   * @param client - SSH Client instance
   * @param command - Lệnh cần thực thi
   */
  static execWithClient(client: Client, command: string): Promise<SSHCommandResult> {
    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";

      client.exec(command, (err, stream) => {
        if (err) return reject(err);

        stream
          .on("close", (code: number, signal: string) => {
            resolve({
              stdout,
              stderr,
              code,
              signal,
            });
          })
          .on("data", (data: Buffer) => {
            stdout += data.toString();
          })
          .stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
          });
      });
    });
  }

  /**
   * Kiểm tra kết nối SSH
   * @param config - Cấu hình SSH connection
   * @returns Promise<boolean> - true nếu kết nối thành công
   */
  static async testConnection(config: SSHConfig): Promise<boolean> {
    try {
      await this.executeCommand(config, 'echo "Connection test"');
      return true;
    } catch (error) {
      this.logger.error("SSH connection test failed:", error);
      return false;
    }
  }

  /**
   * Upload file lên server (sử dụng SFTP)
   * @param config - Cấu hình SSH connection
   * @param localPath - Đường dẫn file local
   * @param remotePath - Đường dẫn file trên server
   */
  static async uploadFile(config: SSHConfig, localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn
        .on("ready", () => {
          conn.sftp((err, sftp) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            sftp.fastPut(localPath, remotePath, (err) => {
              conn.end();
              if (err) return reject(err);
              this.logger.info(`File uploaded: ${localPath} -> ${remotePath}`);
              resolve();
            });
          });
        })
        .on("error", (err) => {
          this.logger.error(`SSH connection error: ${err.message}`);
          reject(err);
        })
        .connect(config);
    });
  }

  /**
   * Download file từ server (sử dụng SFTP)
   * @param config - Cấu hình SSH connection
   * @param remotePath - Đường dẫn file trên server
   * @param localPath - Đường dẫn file local
   */
  static async downloadFile(config: SSHConfig, remotePath: string, localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn
        .on("ready", () => {
          conn.sftp((err, sftp) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            sftp.fastGet(remotePath, localPath, (err) => {
              conn.end();
              if (err) return reject(err);
              this.logger.info(`File downloaded: ${remotePath} -> ${localPath}`);
              resolve();
            });
          });
        })
        .on("error", (err) => {
          this.logger.error(`SSH connection error: ${err.message}`);
          reject(err);
        })
        .connect(config);
    });
  }
}
