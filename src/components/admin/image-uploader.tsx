"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
}

export function ImageUploader({ value, onChange, onRemove, bucket = "portfolio" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
      onChange("");
      if (onRemove) onRemove();
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-500 uppercase">Project Image</label>
        
        {value ? (
            <div className="relative w-full h-48 bg-neutral-100 rounded-xl overflow-hidden group border border-neutral-200">
                <Image 
                    src={value} 
                    alt="Uploaded preview" 
                    fill 
                    className="object-cover"
                />
                <button
                    onClick={handleRemove}
                    type="button"
                    className="absolute top-2 right-2 p-2 bg-white/80 text-neutral-600 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                >
                    <X size={16} />
                </button>
            </div>
        ) : (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-colors group"
            >
                {uploading ? (
                    <Loader2 size={24} className="text-brand-cyan animate-spin" />
                ) : (
                    <>
                        <div className="p-3 bg-neutral-50 rounded-full text-neutral-400 group-hover:text-brand-cyan group-hover:bg-white transition-colors mb-2">
                            <Upload size={20} />
                        </div>
                        <span className="text-sm font-medium text-neutral-500 group-hover:text-brand-cyan">Click to upload image</span>
                        <span className="text-xs text-neutral-400 mt-1">SVG, PNG, JPG (max 2MB)</span>
                    </>
                )}
            </div>
        )}

        {error && (
            <div className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded-lg">
                upload error: {error}
            </div>
        )}

        <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            ref={fileInputRef}
            disabled={uploading}
        />
    </div>
  );
}
