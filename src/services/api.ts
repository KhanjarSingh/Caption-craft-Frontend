const API_URL = 'http://localhost:8000/api'; // Update to match your backend port

interface UploadResponse {
  message: string;
  filename: string;
  path: string;
  size: number;
}

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload video file');
  }

  return response.json();
};

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

interface CaptionResponse {
  message: string;
  captions: Caption[];
}

export const generateCaptions = async (filename: string): Promise<CaptionResponse> => {
  const response = await fetch(`${API_URL}/generate-captions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate captions');
  }

  return response.json();
};