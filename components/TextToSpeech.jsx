'use client';
import { useEffect, useState, useRef } from 'react';

export default function TextToSpeech({ initialText = '', lang = 'ar-SA' }) {
  const [text, setText] = useState(initialText);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      if (v.length && mounted.current) {
        setVoices(v);
        const preferred = v.find(x => x.lang.startsWith(lang)) || v[0];
        setSelectedVoice(preferred?.name || '');
      }
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      mounted.current = false;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang]);

  function speakText(t) {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis غير مدعوم في هذا المتصفح');
      return;
    }
    const utter = new SpeechSynthesisUtterance(t);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = pitch;
    const v = voices.find(x => x.name === selectedVoice);
    if (v) utter.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        style={{ width: '100%', padding: 8, fontSize: 16 }}
        placeholder="اكتب النص الذي تريد تحويله إلى كلام..."
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <button onClick={() => speakText(text)}>🔊 شغّل الصوت</button>
        <button onClick={() => window.speechSynthesis.cancel()}>⏹ إيقاف</button>

        <label>
          صوت:
          <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} style={{ marginLeft: 6 }}>
            {voices.map(v => <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>)}
          </select>
        </label>

        <label>
          سرعة:
          <input type="range" min="0.6" max="1.6" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
        </label>

        <label>
          نبرة:
          <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
