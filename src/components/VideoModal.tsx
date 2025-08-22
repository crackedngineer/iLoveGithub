"use client";

import React from "react";
import {Dialog, DialogContent, DialogOverlay} from "@/components/ui/dialog";
import {DEMO_VIDEO_URL} from "@/constants";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal = ({isOpen, onClose}: VideoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/60 backdrop-blur-md fixed inset-0 z-50" />
      <DialogContent className="w-[90%] sm:w-[80%] md:max-w-3xl p-0 bg-black/90 dark:bg-black/90 overflow-hidden rounded-xl z-50 border-none">
        <div className="w-full aspect-video">
          <iframe
            src={DEMO_VIDEO_URL}
            title="Video"
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
