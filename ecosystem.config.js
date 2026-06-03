module.exports = {
  apps: [
    {
      name: 'virago-pecas',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/home/usuario/virago-pecas',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
