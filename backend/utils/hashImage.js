import crypto from "crypto";
import fs from "fs";

/**
 * Generate SHA256 hash for the uploaded image file
 * @param {string} filePath - Path to the uploaded image file
 * @returns {string} - Hash string
 */
export const generateImageHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return hash;
};
