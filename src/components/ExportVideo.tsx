import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { spring, useVideoConfig } from 'remotion';

export const ExportVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame,
        fps,
        config: {
            damping: 200,
        },
    });

    return (
        <AbsoluteFill className="bg-black">
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Exporting Video</h1>
                    <div className="mb-6">
                        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 origin-left"
                                style={{
                                    transform: `scaleX(${progress})`
                                }}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">
                        Your video is being exported with captions...
                        <br />
                        This may take a few minutes.
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Exporting Video</h1>
                <p>Please wait while your video is being exported with captions...</p>
                <div className="mt-6">
                    <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-blue-400">{progress}%</p>
                </div>
                <p className="mt-4 text-sm text-gray-400">You can close this window once the export is complete.</p>
            </div>
        </div>
    );
};

export default ExportVideo;