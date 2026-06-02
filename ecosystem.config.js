// PM2 process config for W3Codify on EC2 (see DEPLOY.md §3).
// Runs `next start` directly so PM2 manages the Node process cleanly.
module.exports = {
  apps: [
    {
      name: "w3codify",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
