"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, X, Trash2 } from "lucide-react";

type Message = {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadFAQs = async () => {
    try {
      const [startupRes, investorRes] = await Promise.all([
        fetch("/faq/Startups_FAQs.txt"),
        fetch("/faq/Investors_FAQs.txt"),
      ]);

      const startupText = await startupRes.text();
      const investorText = await investorRes.text();
      return `${startupText}\n${investorText}`;
    } catch (error) {
      console.error("Error loading FAQs:", error);
      return "";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const knowledgeBase = await loadFAQs();
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
      });

      const prompt = `You are an investment advisor for both startups and investors. 
        Use this knowledge base: ${knowledgeBase}
        Question: ${inputMessage}
        Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      const botMessage: Message = {
        text: response.text(),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-background w-96 rounded-lg shadow-xl border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Investment Advisor</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat with Advisor
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
