import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`School management API listening on port ${env.PORT}`);
  });
}

void startServer();
