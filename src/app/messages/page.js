"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, getUser } from "@/lib/apiClient";
import Link from "next/link";

function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "indi";
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat`;
  return d.toLocaleDateString("az-AZ");
}

function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");

  const [me, setMe] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  // Auth check
  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setMe(u);
    fetchConversations();
  }, []);

  // Auto-select conversation from URL param
  useEffect(() => {
    if (activeId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === activeId);
      if (conv) openConversation(conv);
    }
  }, [activeId, conversations]);

  // Polling while a conversation is open (every 4s)
  useEffect(() => {
    if (!activeConv) { clearInterval(pollRef.current); return; }
    pollRef.current = setInterval(() => { pollMessages(activeConv.id); }, 4000);
    return () => clearInterval(pollRef.current);
  }, [activeConv]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const data = await apiFetch("/api/conversations");
      setConversations(data.conversations || []);
    } catch { setConversations([]); }
    finally { setLoading(false); }
  }

  async function openConversation(conv) {
    setActiveConv(conv);
    setConvLoading(true);
    try {
      const data = await apiFetch(`/api/conversations/${conv.id}/messages`);
      setMessages(data.messages || []);
      // Mark as read — refresh conversation list to clear unread badge
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, _unread: 0 } : c
      ));
    } catch { setMessages([]); }
    finally {
      setConvLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function pollMessages(convId) {
    try {
      const data = await apiFetch(`/api/conversations/${convId}/messages`);
      setMessages(data.messages || []);
      // Refresh conversation list periodically to update last message preview
      fetchConversations();
    } catch {}
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !activeConv || sending) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      content: text.trim(),
      senderId: me?.id || me?.sub,
      sender: { fullName: "Siz" },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    try {
      await apiFetch(`/api/conversations/${activeConv.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: optimistic.content }),
      });
      // Fetch real messages after send
      const data = await apiFetch(`/api/conversations/${activeConv.id}/messages`);
      setMessages(data.messages || []);
      fetchConversations();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(optimistic.content);
    } finally {
      setSending(false);
    }
  }

  const myId = me?.id || me?.sub;

  function getOtherParty(conv) {
    if (!myId) return null;
    if (conv.buyerId === myId) return conv.seller;
    return conv.buyer;
  }

  function getUnreadCount(conv) {
    // Count messages in this conv not sent by me and not read
    return conv._unread ?? 0;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-black text-gray-900 mb-4">💬 Mesajlar</h1>

      <div className="flex gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm" style={{ height: "70vh" }}>
        {/* LEFT: Conversation List */}
        <div className={`flex flex-col border-r border-gray-200 ${activeConv ? "hidden md:flex" : "flex"} w-full md:w-80 flex-shrink-0`}>
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Söhbətlər</p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Yüklənir...</div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-4xl">💬</span>
              <p className="text-gray-500 font-medium text-sm">Hələ söhbət yoxdur</p>
              <p className="text-gray-400 text-xs">Bir məhsul səhifəsindən satıcıya mesaj göndərin</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                const other = getOtherParty(conv);
                const lastMsg = conv.messages?.[0];
                const isActive = activeConv?.id === conv.id;
                const initial = other?.fullName?.charAt(0)?.toUpperCase() || "?";

                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                      isActive ? "bg-brand-50 border-l-4 border-l-brand-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isActive ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{other?.fullName || "İstifadəçi"}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0">{lastMsg ? timeAgo(lastMsg.createdAt) : ""}</p>
                      </div>
                      {conv.product && (
                        <p className="text-xs text-brand-600 truncate font-medium">{conv.product.titleAz}</p>
                      )}
                      {lastMsg && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{lastMsg.content}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Chat Window */}
        <div className={`flex flex-col flex-1 min-w-0 ${!activeConv ? "hidden md:flex" : "flex"}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <span className="text-5xl">👈</span>
              <p className="text-gray-500 font-medium">Sol tərəfdən bir söhbət seçin</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden text-gray-400 hover:text-gray-600 text-xl leading-none"
                >←</button>
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm flex-shrink-0">
                  {getOtherParty(activeConv)?.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{getOtherParty(activeConv)?.fullName || "İstifadəçi"}</p>
                  {activeConv.product && (
                    <Link href={`/products/${activeConv.product.slug}`} className="text-xs text-brand-600 hover:underline truncate block">
                      📦 {activeConv.product.titleAz}
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {convLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">Yüklənir...</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span className="text-3xl">👋</span>
                    <p className="text-gray-400 text-sm">Söhbəti başlatmaq üçün mesaj göndərin</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === myId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-brand-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                        } ${msg._optimistic ? "opacity-70" : ""}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-brand-200" : "text-gray-400"}`}>
                            {timeAgo(msg.createdAt)}
                            {isMe && !msg._optimistic && msg.readAt && " · ✓✓"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-gray-200 bg-white">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  placeholder="Mesaj yaz..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-gray-50"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-40 flex-shrink-0"
                >
                  {sending ? "..." : "Göndər ➤"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh] text-gray-400">Yüklənir...</div>}>
      <MessagesInner />
    </Suspense>
  );
}
