import fs from "fs";
import path from "path";
import NodeClam from "clamscan";
import { File } from "../models/file.model.js";

const FILES_DIR = path.join(process.cwd(), "src/uploads/files");

let clamscanInstance = null;

const getClamScan = async () => {
  if (clamscanInstance) return clamscanInstance;

  const clamscan = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    scanLog: null,
    debugMode: false,
  });

  clamscanInstance = clamscan;
  return clamscan;
};

export const scanFileForViruses = async (fileId) => {
  const file = await File.findById(fileId);
  if (!file) return;

  const filePath = path.join(FILES_DIR, file.storageName);
  if (!fs.existsSync(filePath)) return;

  try {
    const clamscan = await getClamScan();
    const result = await clamscan.scanFile(filePath);

    if (result.isInfected) {
      file.scanStatus = "infected";
      file.isDisabled = true;
      file.disabledReason = "Virus detected";
    } else {
      file.scanStatus = "clean";
    }

    await file.save({ validateBeforeSave: false });
  } catch (err) {
    console.error("Virus scan failed:", err);
  }
};
