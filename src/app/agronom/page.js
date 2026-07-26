"use client";
import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function AgronomPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const simulateAI = (text, isImage = false) => {
    setLoading(true);
    setTimeout(() => {
      let reply = "Bu simptomlar 'Tuta Absoluta' xəstəliyinə bənzəyir. Tərkibində Abamectin olan dərmanlardan istifadə etməyi məsləhət görürəm.";
      if (isImage) {
        reply = "📸 Şəkili analiz etdim. Yarpaqdakı ağ ləkələr 'Külleme' (Powdery Mildew) göbələk xəstəliyinin əlamətidir. Təcili kükürd əsaslı fungisidlərdən istifadə edin.";
      }
      setMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: 'user' }]);
    simulateAI(input);
    setInput('');
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMessages([...messages, { text: "[Şəkil yükləndi: Analiz edilir...]", sender: 'user' }]);
      simulateAI('', true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-gradient-to-br from-brand-600 to-green-500 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">AI Aqronom</h1>
          <p className="text-lg opacity-90 max-w-lg">
            Problemi yazın və ya xəstə yarpağın şəklini yükləyin. Süni Zəka sizə dərman və gübrə təklif edəcək.
          </p>
        </div>
        <div className="hidden md:block">
          <Icon name="sprout" size={80} className="text-white/20" />
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-[500px]">
        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4 overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm my-auto">
              Söhbətə başlamaq üçün aşağıdan sualınızı yazın və ya "Kamera" ikonuna klikləyərək şəkil yükləyin.
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-brand-600 text-white self-end rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-sm'}`}>
                {m.text}
              </div>
            ))
          )}
          {loading && (
            <div className="bg-white border border-gray-200 text-gray-400 self-start p-3 rounded-2xl rounded-bl-sm flex gap-2 items-center">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-75">●</span>
              <span className="animate-bounce delay-150">●</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <label className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl cursor-pointer transition-colors shrink-0">
            <Icon name="camera" size={24} />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          </label>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Xəstəliyi və ya problemi yazın..." 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
          />
          <button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Göndər
          </button>
        </form>
      </div>
    </div>
  );
}
