module.exports = {
  apps: [
    {
      name: "El-Manar",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      max_restarts: 10,
      env_prod: {
        APP_ENV: "prod", // APP_ENV=prod
      },
    },
  ],
};
