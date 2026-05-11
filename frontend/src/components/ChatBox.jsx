import React, { useState, useRef, useEffect } from 'react';

const ChatBox = ({ messages, currentUser, onSendMessage, onTyping, typingUsers }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Yeni mesaj gelince en alta kaydır
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Yazıyor... sinyali gönder
    onTyping(true);

    // 2 saniye boyunca tuşa basılmazsa "yazmayı bıraktı" sinyali gönder
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    onSendMessage(inputText);
    setInputText("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d13]/50 rounded-2xl overflow-hidden border border-slate-800/40">
      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-black tracking-widest uppercase opacity-50">
            Sohbete ilk mesajı sen yaz
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = String(msg.user?._id || msg.user) === String(currentUser?._id || currentUser?.id);
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
  {/* RESİM KISMI BURAYA EKLENDİ */}
  {msg.user?.avatar ? (
    <img src={msg.user.avatar} className="w-4 h-4 rounded-full object-cover border border-slate-700/50" alt="avatar" />
  ) : (
    <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[7px] font-black text-slate-400 border border-slate-700/50">
      {(msg.username || "U").charAt(0).toUpperCase()}
    </div>
  )}
  {/* İSİM VE SAAT KISMI */}
  <span className={`text-[9px] font-black uppercase tracking-tighter ${isMe ? 'text-indigo-400' : 'text-emerald-400'}`}>
    {isMe ? 'SEN' : msg.username}
  </span>
  <span className="text-[8px] text-slate-500 font-bold">{formatTime(msg.createdAt)}</span>
</div>
                <div className={`px-3 py-2 rounded-xl max-w-[85%] border shadow-sm ${
                  isMe 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-sm' 
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-200 rounded-tl-sm'
                }`}>
                  <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}

        {/* Yazıyor... Animasyonu */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-widest px-2 animate-pulse">
            {typingUsers.join(", ")} yazıyor...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Alanı */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/60 bg-[#0f121a]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Odak bozmadan bir şeyler yaz..."
            className="w-full bg-[#0a0d13] border border-slate-700/50 rounded-xl pl-4 pr-12 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="absolute right-1.5 p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-indigo-600/10 disabled:hover:text-indigo-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;