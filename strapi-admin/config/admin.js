module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '6c7b5c7b08d9ec804b3b3afcda4cb5501b72bcf5ce5e6b1422c0abf7df6155d301dfe403e18a952697a0d0441acc3f2316743d6bcb4be412fd4b30545900b0da'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', '01c3fc5ed62166deaf4c623d84418e94bcaef6fe123a39fb5d1b898d348de22a'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', '7a4a7aab2d457f13ed6f475bb846c72c1aa7b8ea84ffa6209ce968569f822aed'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', '7b86f7ff57e4c3d2ef0f011cdc1167ab43d09e69ad9994f6928e8392960bf062'),
  },
});
