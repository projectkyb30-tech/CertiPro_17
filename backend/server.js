const { createApp } = require('./src/app');
const { env } = require('./src/config/env');

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
