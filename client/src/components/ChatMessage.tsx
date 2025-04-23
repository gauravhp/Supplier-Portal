import { Message } from "@/lib/ai";
import { memo } from "react";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = memo(({ message }: ChatMessageProps) => {
  // Determine the message style based on role
  const isUser = message.role === "user";
  
  if (message.role === "system") {
    return null; // Don't render system messages
  }
  
  return isUser ? (
    <div className="flex items-start justify-end max-w-3xl ml-auto">
      <div className="flex-1 bg-primary text-white rounded-lg px-4 py-2 shadow-sm">
        <p>{message.content}</p>
      </div>
      <div className="flex-shrink-0 ml-3">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-start max-w-3xl">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-lg px-4 py-3 shadow-sm">
        <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
