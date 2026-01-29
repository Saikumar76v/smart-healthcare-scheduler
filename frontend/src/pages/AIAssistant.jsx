import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AIAssistant = () => {
    const [symptoms, setSymptoms] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const res = await api.post('/api/ai/symptom-check', { symptoms });
            setAnalysis(res.data);
        } catch (err) {
            setError('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyStyles = (urgency) => {
        switch (urgency?.toLowerCase()) {
            case 'high': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 healthcare-gradient">
            <div className="max-w-4xl mx-auto">
                {/* Navigation & Header */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <button
                        onClick={() => navigate('/patient')}
                        className="group flex items-center gap-3 bg-white text-slate-500 px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <div className="text-right md:text-left flex-1">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4 md:justify-start">
                            <span>🤖</span> AI Specialist
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Next-Generation Symptom Analysis</p>
                    </div>
                </header>

                {/* Input Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 ring-1 ring-slate-200 overflow-hidden relative mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

                    <form onSubmit={handleAnalyze} className="space-y-8 relative">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Describe your symptoms</label>
                            <textarea
                                className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-lg min-h-[200px] shadow-inner"
                                placeholder="E.g., I've been having a persistent headache and dizziness for the last two days..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-6 rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-[0.98] text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                "Generate Health Report"
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {analysis && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Analysis Card */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 ring-1 ring-slate-200">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Medical Analysis</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Recommended Specialist</p>
                                        <div className="text-2xl font-black text-slate-800">{analysis.specialization}</div>
                                    </div>
                                    <div className={`px-6 py-4 rounded-2xl border-2 inline-block font-black text-[11px] uppercase tracking-[0.2em] ${getUrgencyStyles(analysis.urgency)}`}>
                                        Urgency: {analysis.urgency}
                                    </div>
                                </div>
                            </div>

                            {/* Advice Card */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 ring-1 ring-slate-200 flex flex-col">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Specialist Advice
                                </h3>
                                <p className="text-slate-600 font-bold leading-relaxed flex-1">
                                    {analysis.advice || analysis.suggestedAdvice}
                                </p>
                            </div>
                        </div>

                        {/* Action Card */}
                        <div className="bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl text-white text-center">
                            <h3 className="text-blue-100 font-black text-xl mb-4">Ready to consult a professional?</h3>
                            <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-widest mb-10">We have found specialists matching your needs</p>
                            <button
                                onClick={() => navigate('/book')}
                                className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all shadow-xl active:scale-[0.98]"
                            >
                                Book Consultation Now
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 text-center font-black animate-bounce">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
