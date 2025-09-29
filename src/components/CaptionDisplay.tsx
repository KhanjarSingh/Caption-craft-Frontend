import React, { useState } from 'react';

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

interface CaptionDisplayProps {
    captions: Caption[];
}

const CaptionDisplay: React.FC<CaptionDisplayProps> = ({ captions }) => {
    const [selectedCaption, setSelectedCaption] = useState<number | null>(null);
    const [selectedWord, setSelectedWord] = useState<number | null>(null);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">Captions</h2>
                <div className="space-y-2">
                    {captions.map((caption, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded cursor-pointer transition-colors ${selectedCaption === index
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'hover:bg-gray-100'
                                }`}
                            onClick={() => setSelectedCaption(index)}
                        >
                            <div className="text-sm text-gray-500 mb-1">
                                {formatTime(caption.start)} → {formatTime(caption.end)}
                            </div>
                            <div className="text-gray-800">
                                {caption.words.map((word, wordIndex) => (
                                    <span
                                        key={wordIndex}
                                        className={`inline-block cursor-pointer px-0.5 rounded ${selectedCaption === index && selectedWord === wordIndex
                                                ? 'bg-blue-200'
                                                : 'hover:bg-gray-100'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedWord(wordIndex);
                                            setSelectedCaption(index);
                                        }}
                                        title={`Confidence: ${Math.round(word.probability * 100)}%`}
                                    >
                                        {word.word}
                                    </span>
                                ))}
                            </div>
                            {selectedCaption === index && (
                                <div className="mt-2 text-sm">
                                    <div className="text-gray-500">
                                        Segment Confidence: {Math.abs(Math.round(caption.confidence * 100))}%
                                    </div>
                                    {selectedWord !== null && (
                                        <div className="text-gray-500">
                                            Word: "{caption.words[selectedWord].word.trim()}"
                                            <br />
                                            Time: {formatTime(caption.words[selectedWord].start)} → {formatTime(caption.words[selectedWord].end)}
                                            <br />
                                            Confidence: {Math.round(caption.words[selectedWord].probability * 100)}%
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CaptionDisplay;