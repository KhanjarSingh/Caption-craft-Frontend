import React, { useState, useEffect, useCallback } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo } from 'remotion';
import { getVideoMetadata } from '@remotion/media-utils';
import { CaptionStyle, captionStyles } from './CaptionControls';
import '../styles/captions.css';

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

interface VideoPlayerProps {
    videoUrl: string;
    captions: Caption[];
    onGenerateCaptions: (language: string) => Promise<void>;
    isGenerating: boolean;
    durationInFrames?: number;
    width?: number;
    height?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    captions,
    onGenerateCaptions,
    isGenerating
}) => {
    const [currentCaption, setCurrentCaption] = useState<Caption | null>(null);
    const [currentWords, setCurrentWords] = useState<Word[]>([]);
    const [showCaptions, setShowCaptions] = useState(true);
    const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>(captionStyles[0]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [videoMetadata, setVideoMetadata] = useState<{
        width: number;
        height: number;
        durationInSeconds: number;
    } | null>(null);
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();


    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const metadata = await getVideoMetadata(videoUrl);
                setVideoMetadata(metadata);
                setVideoDuration(metadata.durationInSeconds);
            } catch (error) {
                console.error('Failed to load video metadata:', error);
            }
        };
        loadMetadata();
    }, [videoUrl]);


    const findActiveCaption = useCallback((timeInSeconds: number) => {
        let left = 0;
        let right = captions.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const caption = captions[mid];

            if (timeInSeconds >= caption.start && timeInSeconds <= caption.end) {
                return caption;
            }

            if (timeInSeconds < caption.start) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        return null;
    }, [captions]);


    useEffect(() => {
        const timeInSeconds = frame / fps;


        if (videoDuration && timeInSeconds >= videoDuration) {
            return;
        }


        const activeCaption = findActiveCaption(timeInSeconds);

        if (activeCaption) {
            setCurrentCaption(activeCaption);

            const activeWords = activeCaption.words.filter(
                word => timeInSeconds >= word.start && timeInSeconds <= word.end
            );
            setCurrentWords(activeWords);
        } else {
            setCurrentCaption(null);
            setCurrentWords([]);
        }
    }, [frame, fps, findActiveCaption, videoDuration]); return (
        <AbsoluteFill>
            <div className="relative w-full h-full">
                <div className="ml-64 h-full relative flex items-center justify-center bg-black">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <OffthreadVideo
                            src={videoUrl}
                            className="max-h-full w-auto h-auto object-contain"
                            playbackRate={1}
                        />

                        {showCaptions && currentCaption && (
                            <div className={`absolute inset-0 flex ${selectedStyle.className}`}>
                                <div className="bg-black bg-opacity-60 rounded-lg px-6 py-3 mx-auto max-w-[90%] text-center caption-text">
                                    {currentWords.map((word, index) => (
                                        <span
                                            key={`${word.start}-${index}`}
                                            className={`inline-block mx-0.5 text-2xl font-semibold leading-relaxed tracking-wide ${word.probability > 0.8
                                                ? 'text-green-400'
                                                : word.probability > 0.5
                                                    ? 'text-yellow-400'
                                                    : 'text-red-400'
                                                }`}
                                            title={`Confidence: ${Math.round(word.probability * 100)}%`}
                                            lang="hi"
                                        >
                                            {word.word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <div className="absolute left-0 top-0 h-full w-64 bg-black bg-opacity-85 text-white p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-6 text-center">Caption Settings</h2>

                    <div className="flex-1">
                        <div className="space-y-6">

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">Select Language</h3>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-white mb-3"
                                        disabled={isGenerating}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => onGenerateCaptions(selectedLanguage)}
                                    disabled={isGenerating}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isGenerating ? 'Generating Captions...' : 'Auto-generate Captions'}
                                </button>
                            </div>

                            {/* Caption Toggle */}
                            <div>
                                <h3 className="text-sm text-gray-400 mb-2">Caption Visibility</h3>
                                <button
                                    onClick={() => setShowCaptions(!showCaptions)}
                                    className={`w-full px-4 py-2 rounded-lg border-2 ${showCaptions
                                        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                                        : 'border-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    {showCaptions ? 'Hide Captions' : 'Show Captions'}
                                </button>
                            </div>

                            {/* Caption Style */}
                            <div>
                                <h3 className="text-sm text-gray-400 mb-2">Caption Style</h3>
                                <select
                                    value={selectedStyle.id}
                                    onChange={(e) => {
                                        const style = captionStyles.find(s => s.id === e.target.value);
                                        if (style) setSelectedStyle(style);
                                    }}
                                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                                >
                                    {captionStyles.map((style) => (
                                        <option key={style.id} value={style.id}>
                                            {style.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </div>
                    </div>

                    {/* Export Section */}
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h3 className="text-sm font-semibold mb-2">Export Video</h3>
                        <div className="space-y-4">
                            <button
                                onClick={async () => {
                                    const exportWindow = window.open('', '_blank');
                                    if (!exportWindow) return;

                                    exportWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>Video Export</title>
                                                <style>
                                                    body {
                                                        font-family: system-ui, -apple-system, sans-serif;
                                                        background: #000;
                                                        color: #fff;
                                                        padding: 2rem;
                                                        margin: 0;
                                                        flex-direction: column;
                                                        align-items: center;
                                                        justify-content: center;
                                                        min-height: 100vh;
                                                    }
                                                    .progress-container {
                                                        width: 300px;
                                                        background: #333;
                                                        border-radius: 8px;
                                                        overflow: hidden;
                                                        margin: 1.5rem 0;
                                                    }
                                                    .progress-bar {
                                                        height: 8px;
                                                        background: #3b82f6;
                                                        width: 0%;
                                                        transition: width 0.3s ease;
                                                    }
                                                    .status {
                                                        font-size: 1.1rem;
                                                        margin-bottom: 1rem;
                                                    }
                                                    .log {
                                                        font-family: monospace;
                                                        background: #111;
                                                        padding: 1rem;
                                                        border-radius: 4px;
                                                        width: 100%;
                                                        max-width: 600px;
                                                        margin-top: 1rem;
                                                        white-space: pre-wrap;
                                                    }
                                                </style>
                                            </head>
                                            <body>
                                                <h1>Exporting Video</h1>
                                                <div class="status">Preparing export...</div>
                                                <div class="progress-container">
                                                    <div class="progress-bar"></div>
                                                </div>
                                                <div class="log"></div>
                                            </body>
                                        </html>
                                    `);

                                    const updateProgress = (percent: number, message: string) => {
                                        if (exportWindow.document) {
                                            const bar = exportWindow.document.querySelector('.progress-bar') as HTMLElement;
                                            const status = exportWindow.document.querySelector('.status');
                                            const log = exportWindow.document.querySelector('.log');

                                            if (bar) bar.style.width = `${percent}%`;
                                            if (status) status.textContent = message;
                                            if (log) log.textContent += message + '\n';
                                        }
                                    };

                                    try {
                                        const { exportVideo } = await import('../services/export');
                                        updateProgress(0, 'Starting export...');

                                        const outputPath = await exportVideo('MyComp', {
                                            videoUrl,
                                            captions
                                        }, (progress) => {
                                            updateProgress(
                                                progress,
                                                `Exporting: ${progress}% complete...`
                                            );
                                        });

                                        updateProgress(100, `Export complete! Saved to: ${outputPath}`);


                                        const link = exportWindow.document.createElement('a');
                                        link.href = outputPath;
                                        link.download = 'video-with-captions.mp4';
                                        link.style.cssText = `
                                            display: inline-block;
                                            background: #3b82f6;
                                            color: white;
                                            padding: 12px 24px;
                                            border-radius: 6px;
                                            text-decoration: none;
                                            margin-top: 20px;
                                            font-weight: 500;
                                        `;
                                        link.textContent = 'Download Video';
                                        exportWindow.document.body.appendChild(link);
                                    } catch (error) {
                                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                        console.error('Export failed:', error);
                                        updateProgress(0, `Export failed: ${errorMessage}`);
                                    }
                                }}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                            >
                                <span>Export Video with Captions</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

export default VideoPlayer;