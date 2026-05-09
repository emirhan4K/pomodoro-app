import React, { useState, useRef, useEffect } from 'react';

const ChatBox = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0f121a]">
      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                {msg.user?.username}
              </span>
              <span className="text-[8px] text-slate-500">{msg.time}</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded-xl rounded-tl-none max-w-[90%]">
              <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Alanı */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800/60 bg-[#0b0e14]/50">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mesaj yaz..."
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all pr-12"
          />
          <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;