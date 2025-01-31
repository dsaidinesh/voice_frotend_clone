const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  message: string;
}

export interface Document {
  id: string;
  title: string;
  created_at: string;
}

export interface QAResponse {
  answer: string;
  relevant_sections: {
    id: string;
    content: string;
    similarity: number;
  }[];
}

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (error instanceof Response) {
    throw new Error(`API Error: ${error.status} ${error.statusText}`);
  }
  throw error;
};

// Authentication
export async function register(email: string, password: string): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData) {
        throw new Error(errorData.detail || 'Registration failed');
      }
      throw response;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error);
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Document Management
export async function getDocuments(): Promise<Document[]> {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function uploadDocument(file: File): Promise<Document> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('Please upload a valid PDF file that contains readable text. The file might be empty, scanned, or contain only images.');
      }
      const errorData = await response.json().catch(() => null);
      if (errorData?.detail) {
        throw new Error(errorData.detail);
      }
      throw response;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error);
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete document' }));
      throw new Error(errorData.message || 'Failed to delete document');
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

// Question Answering
export async function askQuestion(question: string, documentIds: string[]): Promise<QAResponse> {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/qa/ask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        document_ids: documentIds,
      }),
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

// Text-to-Speech
export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    // Access the API key using NEXT_PUBLIC prefix since it's used on the client side
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      console.error('Google Cloud API key not found in environment variables');
      throw new Error('Google Cloud API key not configured');
    }

    console.log('Sending TTS request to Google Cloud...');
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            text: text
          },
          voice: {
            languageCode: "en-US",
            name: "en-US-Studio-O",
            ssmlGender: "FEMALE"
          },
          audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: 1,
            volumeGainDb: 0,
            effectsProfileId: ["small-bluetooth-speaker-class-device"]
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('TTS API Error:', errorData);
      throw new Error(
        errorData?.error?.message || 
        `Text-to-speech request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.audioContent) {
      console.error('No audio content in response:', data);
      throw new Error('No audio content received from Google Cloud TTS');
    }
    
    // Convert base64 to ArrayBuffer
    const binaryString = window.atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error instanceof Error ? error : new Error('Failed to convert text to speech');
  }
}

// Authentication helpers
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  return token !== null && token !== undefined && token !== '';
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
}

