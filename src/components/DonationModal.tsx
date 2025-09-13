"use client";

import React, {useEffect, useState} from "react";
import axios from "axios";
import {IndianRupee, Plus, Minus, Coffee} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Slider} from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {DONATION_MERCHANT_NAME} from "@/constants";
import Image from "next/image";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIndiaLocation: boolean | null;
}

const DonationModal = ({isOpen, onClose, isIndiaLocation}: DonationModalProps) => {
  const [amount, setAmount] = useState(101);
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);

  const minAmount = 11;
  const maxAmount = 5001;
  const step = 10;
  const presetAmounts = [101, 201, 501, 1001];

  const handleIncrease = () => {
    setAmount((prev) => Math.min(prev + step, maxAmount));
  };

  const handleDecrease = () => {
    setAmount((prev) => Math.max(prev - step, minAmount));
  };

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (amount !== debouncedAmount) {
        setDebouncedAmount(amount);
      }
    }, 800); // increased debounce delay

    return () => clearTimeout(handler);
  }, [amount]);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const imageUrl = `${origin}/icons/favicon.png`;

        const {data: result} = await axios.post("/api/qrcode/generate", {
          data: `upi://pay?pa=${process.env.NEXT_PUBLIC_DONATION_UPI_ID}&pn=${DONATION_MERCHANT_NAME}&am=${debouncedAmount}&cu=INR`,
          image: imageUrl,
        });

        setQrImage(result.image);
      } catch (error) {
        console.error("QR code generation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isIndiaLocation) {
      generateQR();
    }
  }, [debouncedAmount, isIndiaLocation]);

  return (
    <Dialog
      key={"dialog-donation"}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md w-full p-6 bg-white dark:bg-gray-900 overflow-hidden animate-fade-in rounded-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            {isIndiaLocation ? (
              <IndianRupee className="h-5 w-5 text-blue-500" />
            ) : (
              <Coffee className="h-5 w-5 text-blue-500" />
            )}
            <DialogTitle className="text-xl font-bold">
              {isIndiaLocation ? "Support via UPI" : "Support Our Work"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {isIndiaLocation
              ? "Scan the QR code below to make a donation via UPI"
              : "Your support helps us build better tools for developers"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 mt-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-48 h-48 flex items-center justify-center">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Generating QR...</p>
            ) : (
              qrImage && (
                <Image src={qrImage} className="rounded" alt="QR Code" width={192} height={192} />
              )
            )}
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
              <div className="font-bold text-xl text-blue-600 dark:text-blue-400 flex items-center">
                {isIndiaLocation ? "₹" : "$"} {amount}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full">
              {presetAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant={amount === presetAmount ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setAmount(presetAmount)}
                >
                  {isIndiaLocation ? "₹" : "$"} {presetAmount}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrease}
                disabled={amount <= minAmount}
                className="rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Slider
                value={[amount]}
                min={minAmount}
                max={maxAmount}
                step={step}
                onValueChange={handleSliderChange}
                className="flex-1"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrease}
                disabled={amount >= maxAmount}
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
