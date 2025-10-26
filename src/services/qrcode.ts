import axios from "axios";

export const generateQRCode = async (data: string, image: string): Promise<string> => {
  try {
    const response = await axios.post("/api/qrcode/generate", {data, image});
    return response.data.image;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
