import { useState } from 'react';
import { AbsoluteFill, OffthreadVideo } from 'remotion';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import { uploadVideo, generateCaptions } from './services/api';

interface Word {
    word: string;
    start: number;
    end: number;
    probability: number;
}

interface Caption {
    start: number;
    end: number;
    text: string;
    confidence: number;
    words: Word[];
}

interface MyCompositionProps {
    videoUrl?: string | null;
    captions?: Caption[];
    durationInFrames?: number;
    width?: number;
    height?: number;
}

export const MyComposition: React.FC<MyCompositionProps> = ({
    videoUrl: initialVideoUrl,
    captions: initialCaptions = [],
    durationInFrames = 30 * 60, 
    width = 1920,
    height = 1080,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captions, setCaptions] = useState<Caption[]>(initialCaptions);
    const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl ?? null);
    const [videoDimensions, setVideoDimensions] = useState({ width, height });
    const [videoDuration, setVideoDuration] = useState(durationInFrames);

    const [currentFilename, setCurrentFilename] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleUpload = async (file: File) => {
        try {
            setIsLoading(true);
            setError(null);


            const uploadResponse = await uploadVideo(file);
            console.log('Upload successful:', uploadResponse);


            const videoUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${uploadResponse.filename}`;


            const video = document.createElement('video');
            video.src = videoUrl;

            await new Promise((resolve, reject) => {
                video.addEventListener('loadedmetadata', () => {
                    setVideoDimensions({
                        width: video.videoWidth,
                        height: video.videoHeight
                    });
                    setVideoDuration(Math.floor(video.duration * 30)); 
                    resolve(null);
                });
                video.addEventListener('error', reject);
            });

            setVideoUrl(videoUrl);
            setCurrentFilename(uploadResponse.filename);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Upload failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AbsoluteFill className="bg-gray-100">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Video Caption Generator</h1>

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

                {!isLoading && videoUrl && (
                    <VideoPlayer
                        videoUrl={videoUrl}
                        captions={captions}
                        isGenerating={isGenerating}
                        durationInFrames={videoDuration}
                        width={videoDimensions.width}
                        height={videoDimensions.height}
                        onGenerateCaptions={async () => {
                            if (!currentFilename) return;
                            try {
                                setIsGenerating(true);
                                const captionsResponse = await generateCaptions(currentFilename);
                                console.log('Captions generated:', captionsResponse);
                                setCaptions(captionsResponse.captions);
                            } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to generate captions');
                            } finally {
                                setIsGenerating(false);
                            }
                        }}
                    />
                )}
            </div>
        </AbsoluteFill>
    );
};
