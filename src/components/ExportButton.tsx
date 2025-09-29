import React from 'react';
import { renderMedia } from '@remotion/renderer';
import { Config } from 'remotion';

interface ExportButtonProps {
    disabled: boolean;
    onClick: () => void;
    isExporting: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ disabled, onClick, isExporting }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
            {isExporting ? 'Exporting...' : 'Export Video'}
        </button>
    );
};

export default ExportButton;

export const handleExport = async (outputPath: string) => {
    Config.Preview.setOffthreadVideoOptions({
        offthread: true,
        chromiumFlags: ['--disable-gpu'],
    });

    await renderMedia({
        composition: {
            height: 720,
            width: 1280,
            fps: 30,
            durationInFrames: 900,
            id: 'MyComp',
        },
        serveUrl: process.env.REMOTION_APP_URL || 'http://localhost:3000',
        outputLocation: outputPath,
        codec: 'h264',
        imageFormat: 'jpeg',
    });
};