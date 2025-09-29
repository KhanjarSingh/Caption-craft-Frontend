import React, { useState, useRef } from 'react';

interface VideoUploadProps {
    onUpload: (file: File) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const validateFile = (file: File): boolean => {
        if (!file.type.startsWith('video/')) {
            setError('Please upload a video file');
            return false;
        }
        if (file.size > 200 * 1024 * 1024) { // 200MB limit
            setError('File size must be less than 200MB');
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            onUpload(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div
            className="w-full max-w-xl mx-auto p-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="text-lg mb-2">
                    {isDragging ? 'Drop your audio file here' : 'Drag & drop your audio file here'}
                </div>
                <div className="text-sm text-gray-500">or click to browse</div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="audio/*"
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default AudioUpload;