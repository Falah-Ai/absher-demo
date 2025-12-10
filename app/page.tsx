"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("المتصفح لا يدعم التعرف على الصوت. جرّب Chrome.");
      return;
    }

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

      // قراءة الرد بصوت عالي
      const utterance = new SpeechSynthesisUtterance(data.answer);
      utterance.lang = "ar-SA";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);

      if (data.actionUrl) {
        window.location.href = data.actionUrl;
      }
    };
  };

  return (
    <main style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🎤 مساعد أبشر التجريبي</h1>
      <p>قل: "أريد تجديد جواز السفر" أو "أريد تجديد الهوية"</p>
      <button onClick={startListening}>🎤 اسأل</button>
      <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
    </main>
  );
}
