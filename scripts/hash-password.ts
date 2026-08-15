import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = createInterface({ input, output });
  try {
    const password = await rl.question(
      "Enter the admin password to hash (it will not be stored): ",
    );
    if (!password || password.length < 12) {
      console.error("Use a password with at least 12 characters.");
      process.exitCode = 1;
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    const fingerprint = createHash("sha256").update(password).digest("hex").slice(0, 8);
    console.log("\nPaste this into Vercel as ADMIN_PASSWORD_HASH:\n");
    console.log(hash);
    console.log(`\nLocal check fingerprint (not a secret): ${fingerprint}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
