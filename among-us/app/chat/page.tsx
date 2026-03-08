"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCyberAudio } from "@/app/hooks/useCyberAudio";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Define message types. "system" is for local UI notifications only and won't be sent to Gemini.
interface ChatMessage {
  role: "user" | "model" | "system";
  parts: { text: string }[];
}

export default function ChatPage() {
  const { playHover } = useCyberAudio();
  
  const [messages, setMessages] = useState<ChatMessage[]>([{
     role: "system",
     parts: [{ text: "Initializing Secure Connection...\nI am your AI Mentor, powered by Gemini. Upload your syllabus below, or ask me any cybersecurity question." }]
  }]);
  
  const [input, setInput] = useState("");
  const [syllabusContext, setSyllabusContext] = useState<{data: string, mimeType: string} | null>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'text/markdown'];
    
    // Simplistic check, browser might report generic types, so check extensions too
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt|md)$/i)) {
        setError("Invalid file type. Please upload a PDF, DOCX, TXT, or MD syllabus file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
       const result = event.target?.result as string;
       if (result) {
          const splitResult = result.split(",");
          if (splitResult.length === 2) {
            const base64Data = splitResult[1];
            let mimeType = file.type;
            if (!mimeType || mimeType === "") {
              if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
              else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
              else if (file.name.endsWith('.md')) mimeType = 'text/markdown';
              else mimeType = 'text/plain';
            }
            
            setSyllabusContext({ data: base64Data, mimeType });
            setSyllabusFileName(file.name);
            setError(null);
            
            // Add a system notification to the chat
            setMessages(prev => [...prev, {
               role: "system",
               parts: [{ text: `[SYSTEM LOG]: Successfully parsed syllabus module: ${file.name}. My parameters have been optimized to act as your dedicated exam tutor.` }]
            }]);
          } else {
             setError("Failed to parse file data.");
          }
       }
    };
    reader.onerror = () => {
       setError("Failed to read the file. It may be corrupted.");
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: "user", parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
        // Build the history array to send to Gemini.
        // Google Generative AI STRICTLY requires history to start with user, 
        // alternate user/model, and NOT include the current prompt.
        // It also does not support our custom "system" role.
        
        const geminiHistory = messages.filter(msg => msg.role !== "system");
        
        // Ensure history starts with a user message if it's not empty
        if (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
           geminiHistory.shift(); 
        }

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               history: geminiHistory,
               prompt: input, // send prompt separately
               syllabusContext 
            })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to communicate with AI.");
        }

        const data = await res.json();
        
        setMessages(prev => [...prev, {
            role: "model",
            parts: [{ text: data.text }]
        }]);

    } catch (err: unknown) {
        setError((err as Error).message || "Connection to Gemini failed.");
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark font-inter flex flex-col selection:bg-cyber-green selection:text-cyber-dark">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyber-green rounded-full mix-blend-screen filter blur-[200px] opacity-10 z-0 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 bg-cyber-darker/80 backdrop-blur-md border-b border-cyber-green/30 px-6 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,255,157,0.05)]">
         <div className="flex items-center gap-4">
            <Link href="/home" onMouseEnter={playHover} className="text-gray-400 hover:text-cyber-green transition-colors p-2 border border-gray-700 hover:border-cyber-green/50 rounded flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
               <h1 className="text-xl font-orbitron font-bold text-cyber-green tracking-widest uppercase text-glow-green flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Gemini AI Mentor
               </h1>
               <div className="text-xs font-mono text-gray-400 mt-0.5">Secure Exam Prep Channel</div>
            </div>
         </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 relative z-10 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
         
         {/* Sidebar: Syllabus Upload Zone */}
         <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-cyber-green/20 bg-cyber-darker/50 p-6 flex flex-col">
            <h2 className="font-orbitron text-white text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
               <svg className="w-4 h-4 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Syllabus Injection
            </h2>
            
            <p className="text-xs text-gray-400 mb-6 font-inter">
               Upload your cybersecurity course syllabus (PDF, DOCX, TXT, MD) so Gemini can act as your personalized tutor to help you prepare for exams!
            </p>

            <input 
               type="file" 
               accept=".txt,.md,.pdf,.doc,.docx" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleFileUpload}
            />

            {!syllabusContext ? (
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={playHover}
                  className="w-full relative group overflow-hidden rounded-xl border-2 border-dashed border-cyber-green/30 bg-cyber-green/5 p-8 flex flex-col items-center justify-center gap-3 hover:border-cyber-green hover:bg-cyber-green/10 transition-all duration-300"
               >
                  <svg className="w-10 h-10 text-cyber-green/50 group-hover:text-cyber-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="font-orbitron text-xs tracking-widest text-cyber-green uppercase">Select File</span>
                  <div className="absolute inset-0 bg-cyber-green/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </button>
            ) : (
               <div className="w-full rounded-xl border border-cyber-green shadow-[0_0_15px_rgba(0,255,157,0.1)] bg-[#051510] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyber-green"></div>
                  <div className="p-4 flex items-start gap-3">
                     <svg className="w-6 h-6 text-cyber-green shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <div>
                        <p className="text-sm font-bold text-white mb-1">Syllabus Active</p>
                        <p className="text-xs text-cyber-green font-mono truncate w-48" title={syllabusFileName || ""}>
                           {syllabusFileName}
                        </p>
                     </div>
                  </div>
                  <button 
                     onClick={() => {
                        setSyllabusContext(null);
                        setSyllabusFileName(null);
                        setMessages(prev => [...prev, {
                           role: "model",
                           parts: [{ text: "[SYSTEM LOG]: Syllabus module unlinked. Returning to standard operational parameters." }]
                        }]);
                     }}
                     onMouseEnter={playHover}
                     className="w-full py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-orbitron tracking-widest uppercase transition-colors"
                  >
                     Disconnect Module
                  </button>
               </div>
            )}

            {error && (
               <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                  {error}
               </div>
            )}
         </div>

         {/* Main Chat Area */}
         <div className="flex-1 flex flex-col bg-[#02050D] relative">
            
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto cyber-scrollbar p-6 space-y-6">
               {messages.map((m, i) => {
                  const isModel = m.role === "model";
                  const isSystemLog = isModel && m.parts[0].text.startsWith("[SYSTEM LOG]");

                  if (isSystemLog) {
                     return (
                        <div key={i} className="flex justify-center my-4 animate-fade-in-up">
                           <div className="px-4 py-1.5 rounded-full bg-cyber-dark border border-cyber-blue/30 text-xs font-mono text-cyber-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.3)]">
                              {m.parts[0].text}
                           </div>
                        </div>
                     );
                  }

                  return (
                     <div key={i} className={`flex w-full animate-fade-in-up ${isModel ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex gap-4 max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                           
                           {/* Avatar */}
                           <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isModel ? 'bg-cyber-green/10 border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.2)]' : 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'}`}>
                              {isModel ? (
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              ) : (
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              )}
                           </div>

                           {/* Bubble */}
                           <div className={`p-4 rounded-2xl ${
                              isModel 
                                 ? 'bg-cyber-darker/80 border border-cyber-green/20 text-gray-300 rounded-tl-sm' 
                                 : 'bg-cyber-blue border border-cyber-blue/50 text-cyber-dark font-medium rounded-tr-sm shadow-[0_0_15px_rgba(0,243,255,0.3)] whitespace-pre-wrap'
                              }`}
                           >
                              {isModel && !isSystemLog ? (
                                 <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                       p: ({node: _node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                                       a: ({node: _node, ...props}) => <a className="text-cyber-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                       ul: ({node: _node, ...props}) => <ul className="list-disc pl-6 mb-4 last:mb-0 space-y-1" {...props} />,
                                       ol: ({node: _node, ...props}) => <ol className="list-decimal pl-6 mb-4 last:mb-0 space-y-1" {...props} />,
                                       li: ({node: _node, ...props}) => <li className="pl-1" {...props} />,
                                       h1: ({node: _node, ...props}) => <h1 className="text-2xl font-bold font-orbitron text-white mb-4 mt-6 first:mt-0 tracking-wider" {...props} />,
                                       h2: ({node: _node, ...props}) => <h2 className="text-xl font-bold font-orbitron text-white mb-3 mt-5 first:mt-0 tracking-wide" {...props} />,
                                       h3: ({node: _node, ...props}) => <h3 className="text-lg font-bold font-orbitron text-gray-200 mb-2 mt-4 first:mt-0" {...props} />,
                                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                       code: ({inline, className, children, ...props}: any) => {
                                          return !inline ? (
                                             <pre className="bg-[#02050D] border border-cyber-green/30 rounded-lg p-4 mb-4 overflow-x-auto">
                                                <code className={className} {...props}>
                                                   {children}
                                                </code>
                                             </pre>
                                          ) : (
                                             <code className="bg-cyber-green/10 text-cyber-green px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                                                {children}
                                             </code>
                                          );
                                       },
                                       blockquote: ({node: _node, ...props}) => <blockquote className="border-l-4 border-cyber-green/50 pl-4 py-1 italic text-gray-400 mb-4 bg-cyber-green/5 rounded-r" {...props} />,
                                       table: ({node: _node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full border-collapse border border-cyber-green/20" {...props} /></div>,
                                       th: ({node: _node, ...props}) => <th className="border border-cyber-green/20 bg-cyber-green/10 px-4 py-2 font-bold text-cyber-green text-left" {...props} />,
                                       td: ({node: _node, ...props}) => <td className="border border-cyber-green/20 px-4 py-2" {...props} />
                                    }}
                                 >
                                    {m.parts[0].text}
                                 </ReactMarkdown>
                              ) : (
                                 <>{m.parts[0].text}</>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })}
               
               {isTyping && (
                  <div className="flex w-full justify-start animate-fade-in-up">
                     <div className="flex gap-4 max-w-[85%] flex-row">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-cyber-green/10 border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.2)]">
                           <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-cyber-darker border border-cyber-green/20 rounded-tl-sm flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '0ms' }}></div>
                           <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '150ms' }}></div>
                           <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                     </div>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 border-t border-cyber-green/10 bg-cyber-darker relative z-10">
               <form onSubmit={sendMessage} className="relative flex items-end gap-4 max-w-4xl mx-auto">
                  <div className="flex-1 relative">
                     <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e as unknown as React.FormEvent);
                           }
                        }}
                        placeholder="Ask your AI Mentor about cybersecurity..."
                        className="w-full bg-[#050A1F] border border-cyber-green/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_20px_rgba(0,255,157,0.1)] resize-none min-h-[56px] max-h-32 overflow-y-auto transition-all"
                        rows={1}
                        disabled={isTyping}
                     />
                  </div>
                  <button 
                     type="submit"
                     onMouseEnter={playHover}
                     disabled={!input.trim() || isTyping}
                     className="shrink-0 w-14 h-14 rounded-xl bg-cyber-green/10 border border-cyber-green text-cyber-green flex items-center justify-center hover:bg-cyber-green hover:text-cyber-dark hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                     <svg className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
               </form>
            </div>
         </div>
      </main>

    </div>
  );
}
