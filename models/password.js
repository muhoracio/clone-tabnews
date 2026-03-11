import bcryptjs from "bcryptjs";
import crypto from "crypto";

async function hash(password) {
  const rounds = getNumberOfRounds();
  password = pepperPassword(password);
  return await bcryptjs.hash(password, rounds);
}

async function compare(providedPassword, storedPassword) {
  providedPassword = pepperPassword(providedPassword);
  return await bcryptjs.compare(providedPassword, storedPassword);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function pepperPassword(password) {
  const pepper = process.env.PEPPER || "";
  if (!pepper) return password;

  const pepperedPassword = crypto
    .createHmac("sha256", pepper)
    .update(password)
    .digest("base64");
  return pepperedPassword;
}

const password = {
  hash,
  compare,
};

export default password;
