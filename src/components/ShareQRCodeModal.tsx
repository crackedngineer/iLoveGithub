"use client";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {QrCode, Download} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {generateQRCode} from "@/services/qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
}

const ShareQRCodeModal = ({isOpen, onClose, repoName}: QRCodeModalProps) => {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (isOpen) {
      const fetchQrCode = async () => {
        setLoading(true);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const imageUrl = `${origin}/icons/favicon.png`;
        try {
          const image = await generateQRCode(imageUrl);
          setQrImageUrl(image);
        } catch (err) {
          console.error("Failed to fetch QR code", err);
        } finally {
          setLoading(false);
        }
      };

      fetchQrCode();
    } else {
      setQrImageUrl(null); // reset
    }
  }, [isOpen, repoName]);

  const handleDownload = async () => {
    if (!qrImageUrl) return;

    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    const urlObject = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = urlObject;
    a.download = `${repoName}-qr.png`;
    a.click();
    URL.revokeObjectURL(urlObject);
  };

  return (
    <Dialog
      key={"dialog-qr-code"}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm w-full p-6 bg-white dark:bg-gray-900 overflow-hidden animate-fade-in rounded-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-github-blue" />
            <DialogTitle className="text-xl font-bold">Repository QR Code</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Scan to view {repoName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="w-56 h-56 bg-gray-200 dark:bg-gray-700 animate-pulse-subtle" />
            ) : qrImageUrl ? (
              <img src={qrImageUrl} alt="AI QR Code" className="w-56 h-56 object-contain" />
            ) : (
              <p className="text-gray-400">Failed to load QR</p>
            )}
          </div>

          {qrImageUrl && (
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 break-all">{url}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareQRCodeModal;
