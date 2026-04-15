import 'dotenv/config';
import { createApp } from './app.js';

const port = Number.parseInt(process.env.PORT || '4000', 10);
const app = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[padinig-backend] listening on http://localhost:${port}`);
});

