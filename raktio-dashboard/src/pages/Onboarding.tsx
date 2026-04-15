import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: '',
    industry: '',
    useCase: '',
    companyStage: '',
    source: ''
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/overview');
  };

  const accountTypes = [
    { id: 'startup', label: 'Startup / Founder' },
    { id: 'brand', label: 'Brand / Marketing' },
    { id: 'agency', label: 'Agency' },
    { id: 'pr', label: 'PR / Comms' },
    { id: 'media', label: 'Journalist / Media' },
    { id: 'creator', label: 'Creator / Influencer' },
    { id: 'consultant', label: 'Consultant' },
    { id: 'other', label: 'Other' }
  ];

  const industries = [
    'Technology & Software', 'Consumer Goods', 'Healthcare', 'Financial Services', 
    'Entertainment & Media', 'Politics & Government', 'Education', 'Retail & E-commerce'
  ];

  const useCases = [
    'Campaign Testing', 'Product Launch Validation', 'Crisis Management', 
    'Policy Reaction', 'Audience Research', 'Other'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500/20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mx-auto mb-6">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Welcome to Raktio</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-2">
            Complete your profile to unlock <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><Sparkles className="w-4 h-4" /> 500 Free Credits</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-10 h-2 rounded-full transition-colors duration-300",
                step >= i ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
              )}></div>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl dark:shadow-blue-900/10">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How do you plan to use Raktio?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, accountType: type.id })}
                    className={cn(
                      "p-4 rounded-xl border text-left font-medium transition-all",
                      formData.accountType === type.id 
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600" 
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={!formData.accountType}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tell us about your context</h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry / Sector</label>
                  <select 
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all appearance-none"
                  >
                    <option value="" disabled>Select your industry...</option>
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Use Case</label>
                  <select 
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all appearance-none"
                  >
                    <option value="" disabled>What will you simulate most?</option>
                    {useCases.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.industry || !formData.useCase}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Almost done!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">These optional details help us tailor your experience.</p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Stage <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <select 
                    value={formData.companyStage}
                    onChange={(e) => setFormData({ ...formData, companyStage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all appearance-none"
                  >
                    <option value="">Select stage...</option>
                    <option value="seed">Early Stage / Seed</option>
                    <option value="growth">Growth / Series A-C</option>
                    <option value="enterprise">Enterprise / Public</option>
                    <option value="solo">Solo / Independent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How did you hear about us? <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Twitter, Colleague, Search..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-5 h-5" /> Claim Credits & Start
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
