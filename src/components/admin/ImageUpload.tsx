"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { mediaUrl } from "@/lib/media-url";

interface MediaResult {
  _id: string;
  filename: string;
  width?: number;
  height?: number;
}

interface ImageUploadProps {
  label?: string;
  value?: string; // current mediaId
  onChange: (mediaId: string | undefined) => void;
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUrl = mediaUrl(value);

  const upload = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED.split(",").includes(file.type)) {
        setError("Unsupported file type. Use JPG, PNG, WEBP, or GIF.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`File is too large (max ${MAX_BYTES / 1024 / 1024}MB).`);
        return;
      }

      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/media");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        setUploading(false);
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json.success) {
            const media = json.data as MediaResult;
            onChange(media._id);
          } else {
            setError(json.error || "Upload failed.");
          }
        } catch {
          setError("Upload failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setError("Network error during upload.");
      };
      xhr.send(formData);
    },
    [onChange]
  );

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</label>}

      {currentUrl && !uploading ? (
        <div className="relative w-fit">
          <Image
            src={currentUrl}
            alt="Uploaded image"
            width={160}
            height={120}
            className="h-28 w-40 rounded-md border border-brand-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 rounded-full bg-brand-black p-1 text-white hover:bg-brand-red"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 block text-xs font-semibold text-brand-red hover:underline"
          >
            Replace image
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragActive ? "border-brand-red bg-brand-red/5" : "border-brand-gray-200 hover:border-brand-red"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
              <p className="text-xs font-semibold text-brand-gray-600">Uploading... {progress}%</p>
            </>
          ) : (
            <>
              {currentUrl ? (
                <ImageIcon className="h-6 w-6 text-brand-gray-400" />
              ) : (
                <Upload className="h-6 w-6 text-brand-gray-400" />
              )}
              <p className="text-xs font-semibold text-brand-gray-600">
                Click or drag an image here
              </p>
              <p className="text-[11px] text-brand-gray-400">JPG, PNG, WEBP, GIF up to 8MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
