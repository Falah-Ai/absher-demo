"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");

  // Robust TTS helper that handles iOS/Safari voice loading quirks
  function speakText(text: string) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      console.warn("Speech Synthesis not supported");
      return;
    }

    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;

    const chooseAndSpeak = () => {
      const voices = synth.getVoices() || [];
      const arVoice = voices.find((v: any) => v.lang && v.lang.startsWith("ar")) || voices.find((v: any) => v.lang === "ar-SA");
      if (arVoice) {
        try { utter.voice = arVoice; } catch (e) { /* ignore */ }
      }
      try { synth.cancel(); } catch (e) {}
      try { synth.speak(utter); } catch (e) { console.warn('speak failed', e); }
    };

    const voices = synth.getVoices();
    if (!voices || voices.length === 0) {
      const onVoices = () => {
        chooseAndSpeak();
        synth.removeEventListener('voiceschanged', onVoices);
      };
      synth.addEventListener('voiceschanged', onVoices);
      setTimeout(() => {
        if (synth.getVoices().length) {
          chooseAndSpeak();
          synth.removeEventListener('voiceschanged', onVoices);
        }
      }, 500);
    } else {
      chooseAndSpeak();
    }
  }

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("المتصفح لا يدعم التعرف على الصوت. جرّب Chrome.");
      return;
    }

    // Prime voices on user interaction (fixes iOS/Safari TTS availability)
    try { if (window.speechSynthesis && window.speechSynthesis.getVoices) { window.speechSynthesis.getVoices(); } } catch(e) {}

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.start();

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setResult("سؤالك: " + text);

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      setResult((prev) => prev + "\nالرد: " + data.answer);

      // قراءة الرد بصوت عالي بشكل متوافق مع iOS/Safari
      try { speakText(data.answer); } catch (e) { console.warn('TTS error', e); }

      if (data.actionUrl) {
        window.location.href = data.actionUrl;
      }
    };
  };

  return (
    <div style={{ marginTop: 22 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>🎤 مساعد أبشر التجريبي</h1>
        <p className="absher-muted">قل: "أريد تجديد جواز السفر" أو "أريد تجديد الهوية"</p>

        <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="absher-btn" onClick={startListening}>🎤 اسأل</button>
          <div style={{ flex: 1 }}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
