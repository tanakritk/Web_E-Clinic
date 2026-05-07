import { useState, useRef, useEffect } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

interface UploadFileProps {
  onChange?: (file: File | null) => void;
  description?: string;
  previewUrl?: string | null;
  error?: boolean;
  helperText?: string;
}

const UploadFile = ({ onChange, description, previewUrl, error, helperText }: UploadFileProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (previewUrl !== undefined) {
      setImagePreview(previewUrl);
    }
  }, [previewUrl]);

  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange?.(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.(null);
  };

  return (
    <>
      {!imagePreview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition ${
            isDragging
              ? "border-primary bg-primary/10 text-primary"
              : error
              ? "border-red-500 text-red-500 bg-red-50"
              : "border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUploadOutlinedIcon
            sx={{
              fontSize: 40,
              mb: 1,
              color: isDragging ? "inherit" : "text.secondary",
            }}
          />
          <p className="text-sm font-medium">
            คลิกหรือลากไฟล์มาวางเพื่ออัปโหลด
          </p>
          <p
            className={`text-xs mt-1 ${isDragging ? "text-pink-400" : "text-gray-400"}`}
          >
            {description}
          </p>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden flex items-center justify-center p-2 bg-gray-50">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 object-contain rounded"
          />
          <IconButton
            size="small"
            onClick={handleRemoveImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      {error && helperText && (
        <p className="text-red-500 text-xs mt-1 ml-1 font-['Sarabun',sans-serif]">{helperText}</p>
      )}
    </>
  );
};

export default UploadFile;
