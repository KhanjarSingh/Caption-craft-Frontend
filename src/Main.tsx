import { useState } from 'react';
import { AbsoluteFill } from 'remotion';
import VideoUpload from './components/VideoUpload';
import CaptionDisplay from './components/CaptionDisplay';
import { uploadVideo, generateCaptions } from './services/api';

export const Main: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captions, setCaptions] = useState<string[]>([]);

    const handleUpload = async (file: File) => {
        try {
            setIsLoading(true);
            setError(null);
            const { filename } = await uploadVideo(file);
            const { captions: captionsData } = await generateCaptions(filename);
            setCaptions(captionsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AbsoluteFill className="bg-gray-100">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold text-center mb-8">Audio Caption Generator</h1>

                {error && (
                    <div className="w-full max-w-xl mx-auto mb-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    </div>
                )}

                <VideoUpload onUpload={handleUpload} />

                {isLoading && (
                    <div className="w-full max-w-xl mx-auto p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Processing your video...</p>
                    </div>
                )}

                {!isLoading && captions.length > 0 && <CaptionDisplay captions={captions} />}
            </div>
        </AbsoluteFill>
    );
};

export default Main;