import React from 'react';

export interface CaptionStyle {
    id: string;
    name: string;
    className: string;
}

interface CaptionControlsProps {
    onGenerateCaptions: () => void;
    onStyleChange: (style: CaptionStyle) => void;
    onToggleCaptions: () => void;
    showCaptions: boolean;
    isGenerating: boolean;
    selectedStyle: CaptionStyle;
}

export const captionStyles: CaptionStyle[] = [
    {
        id: 'bottom',
        name: 'Bottom',
        className: 'items-end pb-8'
    },
    {
        id: 'top',
        name: 'Top',
        className: 'items-start pt-8'
    },
    {
        id: 'center',
        name: 'Center',
        className: 'items-center justify-center'
    },
    {
        id: 'karaoke',
        name: 'Karaoke Style',
        className: 'items-end justify-center pb-16 opacity-90 scale-110 transition-all duration-200'
    }
];

const CaptionControls: React.FC<CaptionControlsProps> = ({
    onGenerateCaptions,
    onStyleChange,
    onToggleCaptions,
    showCaptions,
    isGenerating,
    selectedStyle,
}) => {
    return (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 p-4 rounded-lg space-y-3">
            <button
                onClick={onGenerateCaptions}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isGenerating ? 'Generating Captions...' : 'Auto-generate Captions'}
            </button>

            <select
                value={selectedStyle.id}
                onChange={(e) => {
                    const style = captionStyles.find(s => s.id === e.target.value);
                    if (style) onStyleChange(style);
                }}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded"
            >
                {captionStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                        {style.name}
                    </option>
                ))}
            </select>

            <button
                onClick={onToggleCaptions}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
                {showCaptions ? 'Hide Captions' : 'Show Captions'}
            </button>
        </div>
    );
};

export default CaptionControls;