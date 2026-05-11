"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <Card className="relative z-10 w-full max-w-sm mx-auto">
        <CardContent className="pt-6 flex flex-col gap-4">
          <h2 className="text-xl font-heading font-bold">{title}</h2>
          <p className="text-muted-foreground font-base">{message}</p>
          <div className="flex gap-2">
            <Button variant="neutral" className="flex-1 cursor-pointer" onClick={onCancel}>
              Batal
            </Button>
            <Button variant="destructive" className="flex-1 cursor-pointer" onClick={onConfirm}>
              Ya
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
