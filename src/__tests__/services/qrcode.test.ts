import {generateQRCode} from "@/services/qrcode";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    create: jest.fn(() => ({get: jest.fn(), post: jest.fn()})),
    isAxiosError: jest.fn().mockReturnValue(false),
  },
}));

import axios from "axios";

const mockPost = axios.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("generateQRCode", () => {
  it("returns the image string from the API response", async () => {
    const imageData = "data:image/png;base64,iVBORw==";
    mockPost.mockResolvedValueOnce({data: {image: imageData}});

    const result = await generateQRCode("https://example.com", "");
    expect(result).toBe(imageData);
  });

  it("calls the QR code generate endpoint with correct data", async () => {
    mockPost.mockResolvedValueOnce({data: {image: "img"}});

    await generateQRCode("https://example.com", "logo.png");
    expect(mockPost).toHaveBeenCalledWith("/api/qrcode/generate", {
      data: "https://example.com",
      image: "logo.png",
    });
  });

  it("propagates errors thrown by the API call", async () => {
    mockPost.mockRejectedValueOnce(new Error("QR API failed"));

    await expect(generateQRCode("https://example.com", "")).rejects.toThrow("QR API failed");
  });

  it("passes the data and image parameters to the POST request", async () => {
    mockPost.mockResolvedValueOnce({data: {image: "result"}});

    await generateQRCode("my-data", "my-logo");
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({data: "my-data", image: "my-logo"}),
    );
  });

  it("handles an empty data string", async () => {
    mockPost.mockResolvedValueOnce({data: {image: "empty-qr"}});

    const result = await generateQRCode("", "");
    expect(result).toBe("empty-qr");
  });
});
