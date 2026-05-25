import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [corporateId, setCorporateId] = useState('');
  const [password, setPassword] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!email) {
        toast.error('Email is required.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (password.length < 12) {
        toast.error('Passphrase must be at least 12 characters.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Obsidian Cipher registered successfully!');
    navigate(ROUTES.LOGIN);
  };

  const lenOk = password.length >= 12;
  const specialOk = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const numOk = /\d/.test(password);
  const entOk = password.length > 5;

  return (
    <div className="w-full min-h-screen bg-background flex flex-col justify-center py-12 px-margin-mobile md:px-margin-desktop overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <pattern height="40" id="hex" patternUnits="userSpaceOnUse" width="40">
            <path d="M20 0 L40 10 L40 30 L20 40 L0 30 L0 10 Z" fill="none" stroke="currentColor" strokeWidth="1"></path>
          </pattern>
          <rect fill="url(#hex)" height="100%" width="100%"></rect>
        </svg>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start animate-fade-in pt-16">
        {/* Left Side: Step progress indicators */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface leading-tight">
              Forge Your <br/>
              <span className="text-primary italic">Obsidian Cipher.</span>
            </h1>
            <p className="text-on-surface-variant text-body-md max-w-[384px]">
              Enterprise-grade document encryption powered by decentralized intelligence. Initialize your secure vault.
            </p>
          </div>
          
          <nav className="flex flex-col gap-6 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/5"></div>
            
            <div className={`flex items-center gap-4 group relative z-10 transition-opacity ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > 1 ? 'bg-green-500 text-white' : 'bg-primary text-on-primary'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div className="flex flex-col">
                <span className="text-label-mono font-label-mono text-primary text-[10px]">STEP 01</span>
                <span className="text-body-md font-semibold text-on-surface">Identity</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 group relative z-10 transition-opacity ${currentStep >= 2 ? 'opacity-100' : 'opacity-45'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > 2 ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-white/10 text-on-surface-variant'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div className="flex flex-col">
                <span className="text-label-mono font-label-mono text-on-surface-variant text-[10px]">STEP 02</span>
                <span className="text-body-md font-semibold text-on-surface">Security</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 group relative z-10 transition-opacity ${currentStep >= 3 ? 'opacity-100' : 'opacity-45'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-white/10 text-on-surface-variant'
              }`}>
                3
              </div>
              <div className="flex flex-col">
                <span className="text-label-mono font-label-mono text-on-surface-variant text-[10px]">STEP 03</span>
                <span className="text-body-md font-semibold text-on-surface">Vault Setup</span>
              </div>
            </div>
          </nav>
          
          <div className="glass-card p-6 rounded-xl space-y-4 overflow-hidden relative border-none bg-surface-container">
            <div className="shimmer absolute inset-0 pointer-events-none"></div>
            <div className="flex justify-between items-center">
              <span className="text-label-mono font-label-mono text-on-surface-variant">NODE LOCATION</span>
              <span className="text-label-mono font-label-mono text-primary">ENCRYPTED_TUNNEL_04</span>
            </div>
            <div className="h-[1px] bg-white/5 w-full"></div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-body-sm text-on-surface-variant">
                {currentStep === 1 && 'Waiting for identity handshake...'}
                {currentStep === 2 && 'Measuring passphrase entropy...'}
                {currentStep === 3 && 'Biometric telemetry synchronized.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Step forms */}
        <div className="lg:col-span-8 w-full">
          <div className="glass-card p-8 md:p-12 rounded-xl shadow-2xl space-y-10 w-full relative">
            <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${(currentStep / 3) * 100}%` }}></div>

            {currentStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-8 animate-fade-in">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">corporate_fare</span>
                    <h2 className="text-headline-md font-headline-md text-on-surface">Corporate Identity</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-label-mono font-label-mono text-on-surface-variant uppercase tracking-widest text-[11px]">Work Email</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300" 
                        placeholder="name@corporation.com" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-mono font-label-mono text-on-surface-variant uppercase tracking-widest text-[11px]">Corporate ID</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-label-mono" 
                        placeholder="CID-XXXX-XXXX" 
                        type="text" 
                        value={corporateId}
                        onChange={(e) => setCorporateId(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
                <div className="pt-6 flex justify-end">
                  <button type="submit" className="bg-primary text-on-primary py-3 px-8 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer font-bold">
                    <span>Next step</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleNextStep} className="space-y-8 animate-fade-in">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">key_visualizer</span>
                    <h2 className="text-headline-md font-headline-md text-on-surface">Vault Access Key</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 pr-12 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300" 
                        placeholder="Generate strong passphrase" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low border border-white/5 transition-all duration-300">
                        <div className={`w-2 h-2 rounded-full ${lenOk ? 'bg-primary' : 'bg-error'} shadow-[0_0_8px_rgba(255,179,173,0.5)] transition-colors`}></div>
                        <span className="text-label-mono font-label-mono text-[11px] text-on-surface-variant">12+ Chars</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low border border-white/5 transition-all">
                        <div className={`w-2 h-2 rounded-full ${specialOk ? 'bg-primary' : 'bg-error'} shadow-[0_0_8px_rgba(255,179,173,0.5)] transition-colors`}></div>
                        <span className="text-label-mono font-label-mono text-[11px] text-on-surface-variant">Special @</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low border border-white/5 transition-all">
                        <div className={`w-2 h-2 rounded-full ${numOk ? 'bg-primary' : 'bg-error'} shadow-[0_0_8px_rgba(255,179,173,0.5)] transition-colors`}></div>
                        <span className="text-label-mono font-label-mono text-[11px] text-on-surface-variant">Numeric 0-9</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low border border-white/5 transition-all">
                        <div className={`w-2 h-2 rounded-full ${entOk ? 'bg-primary' : 'bg-error'} shadow-[0_0_8px_rgba(255,179,173,0.5)] transition-colors`}></div>
                        <span className="text-label-mono font-label-mono text-[11px] text-on-surface-variant">Entropy Map</span>
                      </div>
                    </div>
                  </div>
                </section>
                <div className="pt-6 flex justify-between">
                  <button type="button" onClick={handlePrevStep} className="border border-outline-variant hover:bg-white/5 text-on-surface py-3 px-8 rounded-lg transition-all flex items-center gap-3 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button type="submit" className="bg-primary text-on-primary py-3 px-8 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer font-bold">
                    <span>Next step</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-8 animate-fade-in">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
                    <h2 className="text-headline-md font-headline-md text-on-surface">Security Clearance</h2>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <label className="flex-1 glass-card p-6 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-all group bg-surface-container-lowest">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-3xl">face</span>
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">Biometric Link</p>
                          <p className="text-body-sm text-on-surface-variant">Face ID / Touch ID Access</p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={biometricsEnabled}
                          onChange={(e) => setBiometricsEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </label>
                    
                    <div className="flex-1 glass-card p-6 rounded-xl border border-white/10 flex items-center gap-4 opacity-50 grayscale cursor-not-allowed bg-surface-container-lowest">
                      <div className="w-12 h-12 rounded-full bg-on-surface-variant/10 flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-3xl">shield_person</span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">Hardware Key</p>
                        <p className="text-body-sm text-on-surface-variant">YubiKey Integration</p>
                      </div>
                      <span className="ml-auto text-label-mono font-label-mono text-[10px] bg-white/10 px-2 py-1 rounded">PRO</span>
                    </div>
                  </div>
                </section>

                <div className="pt-6 space-y-6">
                  <div className="flex justify-between">
                    <button type="button" onClick={handlePrevStep} className="border border-outline-variant hover:bg-white/5 text-on-surface py-3 px-8 rounded-lg transition-all flex items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Back</span>
                    </button>
                    <button type="submit" className="bg-primary text-on-primary py-3 px-8 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer font-bold shadow-xl shadow-primary/20">
                      <span>Create Secure Account</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 border-t border-white/5 pt-6">
                    <p className="text-body-sm text-on-surface-variant">
                      Already have an account? <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline decoration-2">Sign In</Link>
                    </p>
                    <p className="text-label-mono font-label-mono text-[10px] text-on-surface-variant/40 text-center uppercase">
                      By proceeding, you agree to the SecureDoc AI master service agreement <br/> and cryptographic compliance standards.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
