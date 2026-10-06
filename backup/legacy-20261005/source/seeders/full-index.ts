import "reflect-metadata";
import { FullDatabaseSeeder } from "./FullDatabaseSeeder";

FullDatabaseSeeder.run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Full database seeding failed:", error);
    process.exit(1);
  });

