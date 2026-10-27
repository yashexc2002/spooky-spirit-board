"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  // Ghost ka final jawab yahan save hoga
  const [fullAnswer, setFullAnswer] = useState(""); 
  // Screen par jo ek-ek letter type hoga woh yahan aayega
  const [displayedAnswer, setDisplayedAnswer] = useState("The spirits are listening...");
  
  const [isReady, setIsReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Waking the spirits (Loading AI model)...");
  const [isSummoning, setIsSummoning] = useState(false);
  
  const [isSoundOn, setIsSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const worker = useRef<Worker | null>(null);

  // GHOST TYPING EFFECT (Typewriter)
  useEffect(() => {
    if (!fullAnswer) return;
    
    setDisplayedAnswer(""); // Purana text clear karo
    let i = 0;
    
    const typingInterval = setInterval(() => {
      setDisplayedAnswer((prev) => prev + fullAnswer.charAt(i));
      i++;
      if (i >= fullAnswer.length) {
        clearInterval(typingInterval);
        setIsSummoning(false); // Typing khatam hone ke baad button wapas chalu karo
      }
    }, 60); // 60ms ka delay - thoda slow aur creepy

    return () => clearInterval(typingInterval);
  }, [fullAnswer]);


  // HORROR SOUND FUNCTION
  const toggleSound = () => {
    if (isSoundOn) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsSoundOn(false);
    } else {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 45;
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 47;
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.3; 
        
        osc1.connect(droneGain);
        osc2.connect(droneGain);
        droneGain.connect(ctx.destination);

        const ghostOsc = ctx.createOscillator();
        ghostOsc.type = 'sine';
        ghostOsc.frequency.value = 600; 
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 3; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 50; 
        
        lfo.connect(lfoGain);
        lfoGain.connect(ghostOsc.frequency);

        const ghostGain = ctx.createGain();
        ghostGain.gain.value = 0.03; 

        ghostOsc.connect(ghostGain);
        ghostGain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        ghostOsc.start();
        lfo.start();
      } else {
        audioCtxRef.current.resume();
      }
      setIsSoundOn(true);
    }
  };

  // AI WORKER SETUP
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });

      worker.current.addEventListener('message', (e) => {
        const data = e.data;
        
        if (data.status === 'init' || data.status === 'progress') {
          setLoadingMsg(`Summoning knowledge from the void... ${Math.round(data.progress || 0)}%`);
        } else if (data.status === 'ready') {
          setIsReady(true);
          setLoadingMsg("");
          setDisplayedAnswer("The spirits are ready...");
        } else if (data.status === 'complete') {
          setFullAnswer(data.output); // Ghost ne jawab bhej diya, ab typing shuru hogi
        }
      });

      worker.current.postMessage({ type: 'load' });
    }
  }, []);

  const handleSummon = () => {
    if (!question.trim() || isSummoning || !isReady) return;
    
    setIsSummoning(true);
    setFullAnswer(""); // Purana answer clear karo
    setDisplayedAnswer("Consulting the beyond..."); // Loading text
    
    worker.current?.postMessage({ text: question });
    setQuestion(""); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-serif flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      
      {/* Sound Button - Mobile Responsive */}
      <button 
        onClick={toggleSound}
        className="absolute top-4 right-4 md:top-6 md:right-6 border border-zinc-800 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:border-red-900/40 transition-colors z-10"
      >
        Sound: {isSoundOn ? 'ON' : 'OFF'}
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-900/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

      <h1 className="text-3xl sm:text-4xl md:text-6xl font-normal mb-8 md:mb-12 tracking-[0.15em] md:tracking-[0.2em] text-center text-zinc-600 drop-shadow-md opacity-80 uppercase relative mt-12 md:mt-0">
        Spirit <span className="text-red-900/60">Board</span>
      </h1>

      {/* Answer Board - Mobile Responsive */}
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.9)] md:shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 md:p-10 rounded-sm mb-8 md:mb-12 min-h-[150px] md:min-h-[200px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] pointer-events-none"></div>
        
        {!isReady ? (
          <p className="text-xs sm:text-sm md:text-base text-red-900/80 uppercase tracking-widest animate-pulse">
            {loadingMsg}
          </p>
        ) : (
          <p className="text-lg sm:text-xl md:text-3xl text-zinc-400 italic tracking-wide">
            "{displayedAnswer}"
            {/* Blinking cursor effect jab typing chal rahi ho */}
            {isSummoning && fullAnswer && <span className="animate-ping ml-1">|</span>}
          </p>
        )}
      </div>

      {/* Input Area - Mobile Responsive */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6 md:gap-8 relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSummon()}
          placeholder={isReady ? "Ask your question..." : "Wait for the spirits..."}
          disabled={!isReady || isSummoning}
          className="w-full bg-transparent border-b border-zinc-800 pb-2 md:pb-3 text-center text-lg md:text-2xl text-zinc-300 placeholder:text-zinc-800 focus:outline-none focus:border-red-900/50 transition-colors italic disabled:opacity-50"
        />
        <button 
          onClick={handleSummon}
          disabled={!isReady || isSummoning}
          className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/10 transition-all duration-500 tracking-[0.2em] md:tracking-[0.4em] uppercase text-xs md:text-sm disabled:opacity-30 disabled:hover:bg-transparent"
        >
          {isSummoning && !fullAnswer ? "Channeling..." : "Summon"}
        </button>
      </div>
    </div>
  );
}