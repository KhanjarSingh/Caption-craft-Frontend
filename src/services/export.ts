import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import type { WebpackConfiguration } from 'webpack';
import { getVideoMetadata } from '@remotion/media-utils';

interface Caption {
    start: number;
    end: number;
    text: string;
    confidence: number;
    words: {
        word: string;
        start: number;
        end: number;
        probability: number;
    }[];
}

export const exportVideo = async (
    compositionId: string,
    inputProps: {
        videoUrl: string;
        captions: Caption[];
    },
    onProgress: (progress: number) => void
): Promise<string> => {
    try {
        // Get video metadata for dimensions and duration
        const metadata = await getVideoMetadata(inputProps.videoUrl);
        
        // Bundle the video
        const serveUrl = await bundle({
            entryPoint: require.resolve('../Root.tsx'),
            webpackOverride: (config: WebpackConfiguration) => config,
        });

        // Calculate output filename
        const timestamp = Date.now();
        const outputLocation = `out/video-${timestamp}.mp4`;

        // Render with actual video metadata
        await renderMedia({
            codec: "h264",
            composition: compositionId,
            serveUrl,
            outputLocation,
            inputProps: {
                videoUrl: inputProps.videoUrl,
                captions: inputProps.captions,
                durationInFrames: Math.floor(metadata.durationInSeconds * 30), // Convert to frames at 30fps
                width: metadata.width,
                height: metadata.height,
            },
            onProgress: ({ progress }) => {
                onProgress(Math.floor(progress * 100));
            },
        });

        return outputLocation;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};