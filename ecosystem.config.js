module.exports = {
  apps: [
    {
      name: "BE_BOC_XEP_HANG_HOA",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        CHROMIUM_PATH: "/usr/bin/chromium-browser",
      },
      env_production: {
        NODE_ENV: "production",
        CHROMIUM_PATH: "/usr/bin/chromium-browser",
      },
    },
    {
      name: "WORKER",
      script: "dist/worker.js",
      instances: 1, // Chạy 2 worker instances để xử lý song song
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
