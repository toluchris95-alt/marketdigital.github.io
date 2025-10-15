// src/services/kycService.js
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const OCR_API = process.env.REACT_APP_OCR_API || "https://api.ocr.space/parse/image";
const OCR_KEY = process.env.REACT_APP_OCR_KEY; // optional, only if you enable OCR.Space

/**
 * Upload ID document + extract text using OCR
 */
export async function uploadAndValidateKYC({ uid, nin, idFile }) {
  if (!uid || !nin || !idFile) throw new Error("Missing required fields");

  // 1️⃣ Upload ID document
  const path = `kyc/${uid}/${idFile.name}`;
  const sRef = ref(storage, path);
  await uploadBytes(sRef, idFile);
  const idUrl = await getDownloadURL(sRef);

  // 2️⃣ Optional OCR validation (basic)
  let validation = { success: true, confidence: 0 };
  if (OCR_KEY) {
    const formData = new FormData();
    formData.append("apikey", OCR_KEY);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("file", idFile);

    const res = await fetch(OCR_API, { method: "POST", body: formData });
    const data = await res.json();
    const parsedText = data?.ParsedResults?.[0]?.ParsedText || "";

    // Quick match check
    const matched = parsedText.toLowerCase().includes(nin.toLowerCase());
    validation = { success: matched, confidence: matched ? 0.95 : 0.5, text: parsedText };
  }

  // 3️⃣ Save record
  await updateDoc(doc(db, "users", uid), {
    kyc: {
      nin,
      idUrl,
      verified: false,
      confidence: validation.confidence,
      ocrText: validation.text || "",
      submittedAt: new Date(),
      status: validation.success ? "pending" : "needs_review",
    },
  });

  return {
    idUrl,
    validation,
    message: validation.success
      ? "KYC submitted successfully. Pending admin verification."
      : "KYC uploaded but OCR could not match NIN automatically.",
  };
}
