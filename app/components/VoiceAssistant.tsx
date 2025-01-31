import { Mic, StopCircle } from 'lucide-react';

const VoiceAssistant = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-8 text-white">Voice Assistant</h1>
        
      {/* Microphone icon centered */}
      <div className="mb-4">
        <Mic className="w-12 h-12 text-blue-500" />
      </div>

          <button 
        className="bg-neutral-700/50 text-neutral-400 px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => {}}
          >
        <StopCircle className="w-4 h-4" />
            Interrupt AI
          </button>

      <p className="text-neutral-400 mt-4">Select documents to start</p>
    </div>
  );
};

export default VoiceAssistant; 