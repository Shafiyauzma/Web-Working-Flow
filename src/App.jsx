import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Server, Lock, Database, Terminal, CheckCircle2, ChevronRight, Play, Pause, SkipBack, SkipForward, RotateCcw, Search, ShoppingCart } from 'lucide-react';
import './App.css';

function App() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState('register'); // 'register' then 'login'
  const [isTransitioning, setIsTransitioning] = useState(true); // Start in transition
  const traceRef = useRef(null);

  // Track orientation to detect portrait→landscape rotation and reset to Phase 1
  const wasPortrait = useRef(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleOrientationChange = () => {
      const isNowPortrait = window.innerHeight > window.innerWidth;
      const wasInPortrait = wasPortrait.current;
      wasPortrait.current = isNowPortrait;

      // If user just rotated FROM portrait TO landscape → reset to Phase 1
      if (wasInPortrait && !isNowPortrait) {
        setMode('register');
        setStep(0);
        setIsPlaying(true);
        setIsTransitioning(true);
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    // Also listen to the native orientation change event for real devices
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Core Automation Loop
  useEffect(() => {
    // 1. Handle Cinematic Transition
    if (isTransitioning) {
      if (!isPlaying) return; 
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setStep(0);
      }, 3500); 
      return () => clearTimeout(transitionTimer);
    }

    // 2. Handle Simulation Steps
    if (!isPlaying) return;

    const timers = {
      0: 2000, 
      1: 1500, // Client opens portal
      2: 2500, // input name/email (HIGHLIGHTED)
      3: 2000, // input pwd (HIGHLIGHTED)
      4: 1000,  // ready to submit / click button
      5: 2000, // Client -> Gateway
      6: 2000, // Gateway -> Auth
      7: 2000, // Auth prep
      8: 2000, // Auth -> DB
      9: 2500, // DB query
      10: 2000, // Auth -> Gateway
      11: 2000, // Gateway -> Client
      12: 1500, // UI update
      13: 4000  // Reset delay
    };

    const nextStep = () => {
      if (step >= 13) {
        // Flow is completely done! Time to sequence the next phase.
        setMode(prev => prev === 'register' ? 'login' : 'register');
        setIsTransitioning(true);
      } else {
        setStep(step + 1);
      }
    };

    const timer = setTimeout(nextStep, timers[step] || 1000);
    return () => clearTimeout(timer);
  }, [step, isPlaying, isTransitioning]);

  // Keep live trace scrolled to bottom
  useEffect(() => {
    if (traceRef.current) {
      const activeItem = traceRef.current.querySelector('.trace-item.active');
      if (activeItem) {
        traceRef.current.scrollTo({
          top: activeItem.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  }, [step, isTransitioning]);

  const traceDataLogin = [
    { triggerStep: 0, title: "Waiting", desc: "The system is ready and waiting for someone to try logging in." },
    { triggerStep: 1, title: "Opening Page", desc: "You just landed on the Login page of the website." },
    { triggerStep: 2, title: "Email Entry", desc: "You are typing your email address into the box." },
    { triggerStep: 3, title: "Password Entry", desc: "You are safely typing your secret password." },
    { triggerStep: 4, title: "Clicking Login", desc: "You clicked the 'Continue' button to start the login process." },
    { triggerStep: 5, title: "Sending Data", desc: "Your browser is sending your email and password to the server safely." },
    { triggerStep: 6, title: "Security Gate", desc: "The server's front door (API Gateway) checks if the request is allowed." },
    { triggerStep: 7, title: "Checking ID", desc: "The Login Service gets your data and prepares to verify your identity." },
    { triggerStep: 8, title: "Finding You", desc: "The service looks for your account details in the big digital filing cabinet (Database)." },
    { triggerStep: 9, title: "Password Check", desc: "The system compares your typed password with the one stored safely in the database." },
    { triggerStep: 10, title: "Making a Key", desc: "Everything matches! The system creates a special digital 'key' (Token) for your session." },
    { triggerStep: 11, title: "Sending Success", desc: "The server sends the digital key back to your browser." },
    { triggerStep: 12, title: "Logged In!", desc: "Your browser saves the key. You are now successfully logged in!" },
    { triggerStep: 13, title: "All Done", desc: "The process is complete and the system is back to normal." }
  ];

  const traceDataRegister = [
    { triggerStep: 0, title: "Waiting", desc: "The system is resting and waiting for a new user to sign up." },
    { triggerStep: 1, title: "Opening Page", desc: "You just clicked 'Create account' to start the journey." },
    { triggerStep: 2, title: "Your Info", desc: "You are filling in your name and email address." },
    { triggerStep: 3, title: "Setting Password", desc: "You are choosing a strong password for your new account." },
    { triggerStep: 4, title: "Joining Up", desc: "You clicked 'Verify email' to officially send your request." },
    { triggerStep: 5, title: "Sending Info", desc: "Your browser packages your info and sends it across the internet to the server." },
    { triggerStep: 6, title: "Security Gate", desc: "The server's 'front desk' (API Gateway) confirms the request is okay." },
    { triggerStep: 7, title: "Protecting Data", desc: "The server scrambles your password into a secret code (Hashing) so no one can read it." },
    { triggerStep: 8, title: "Saving You", desc: "The server tells the database to create a permanent spot for your new account." },
    { triggerStep: 9, title: "Success!", desc: "The database confirms your account has been safely written down." },
    { triggerStep: 10, title: "Making a Key", desc: "The system creates a digital 'key' (Token) so you can start using the site right away." },
    { triggerStep: 11, title: "Coming Home", desc: "The server sends the welcome message and your key back to your browser." },
    { triggerStep: 12, title: "Welcome!", desc: "Your browser saves the key. Your new account is ready to go!" },
    { triggerStep: 13, title: "All Done", desc: "The registration is finished and the system is ready for the next person." }
  ];

  const activeTraceSet = mode === 'login' ? traceDataLogin : traceDataRegister;

  const getActiveTraceIndex = () => {
    let activeIdx = 0;
    for (let i = 0; i < activeTraceSet.length; i++) {
      if (step >= activeTraceSet[i].triggerStep) activeIdx = i;
    }
    return activeIdx;
  };

  const activeIdx = getActiveTraceIndex();

  return (
    <div className="app-container">

      {/* PORTRAIT MOBILE: Rotate Screen Prompt */}
      <div className="rotate-prompt">
        <div className="rotate-icon">↻</div>
        <h2 className="rotate-title">Rotate Your Phone</h2>
        <p className="rotate-desc">This app is designed for landscape view.<br/>Please rotate your device horizontally.</p>
      </div>

      {/* AMBIENT AURORA ORBS (Cute & Professional Vibe) */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      {/* FULL PAGE CINEMATIC TRANSITION */}
      <div className={`scene-transition ${isTransitioning ? 'active' : ''}`}>
        {isTransitioning && (
          <div className="transition-content">
            <h2 className="purpose-tagline">Backend Blueprint</h2>
            <h1 className="transition-text">
              {mode === 'register' ? 'PHASE 1: REGISTRATION FLOW' : 'PHASE 2: LOGIN FLOW'}
            </h1>
            <p className="purpose-desc">
              {mode === 'register' 
                ? 'Visualizing the secure journey of account creation from frontend to database.' 
                : 'Understanding how identity is verified and sessions are established.'}
            </p>
          </div>
        )}
      </div>

      <header className="system-header">
        <div className="header-brand">
          <div className="cute-logo-icon">
            <Terminal size={18} color="#fff"/>
          </div>
          <span className="header-title-text">
             {isTransitioning ? 'Initializing System...' : (mode === 'register' ? 'How Backend Works When We Are Registering' : 'How Backend Works When We Are Logging In')}
          </span>
        </div>
        
        {/* Playback Controls */}
        <div className="header-controls">
           <button onClick={() => setStep(s => Math.max(0, s - 1))} className="ctrl-btn" title="Previous Step" disabled={isTransitioning}><SkipBack size={14} /></button>
           <button onClick={() => setIsPlaying(!isPlaying)} className={`ctrl-btn primary ${isPlaying ? 'playing' : 'paused'}`} title={isPlaying ? "Pause" : "Play"}>
             {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
           </button>
           <button onClick={() => setStep(s => Math.min(13, s + 1))} className="ctrl-btn" title="Next Step" disabled={isTransitioning}><SkipForward size={14} /></button>
           <div className="divider"></div>
           <button onClick={() => { setIsTransitioning(true); setMode('register'); setIsPlaying(true); }} className="ctrl-btn" title="Restart Full Sequence"><RotateCcw size={14} /></button>
        </div>

        <div className="header-status">
          <span className={`live-pulse ${!isPlaying ? 'paused-pulse' : ''} ${isTransitioning ? 'hidden' : ''}`}></span>
          {isTransitioning ? 'System Standby' : (isPlaying ? 'Live Simulation' : 'Paused')}
        </div>
      </header>
      
      <div className="content-wrapper">
        <div className="three-column-layout">
          
          {/* COLUMN 1: CLIENT UI (Amazon Theme - Softened) */}
          <div className="glass-panel col-client amazon-theme">
            
            <div className="amazon-ui-wrapper">
               <div className="amazon-nav">
                 <div className="amazon-brand">amazon</div>
                 <div className="amazon-search">
                   <input type="text" placeholder="Search..." disabled />
                   <div className="search-btn"><Search size={14} color="#131921"/></div>
                 </div>
                 <div className="amazon-cart">
                   <ShoppingCart size={18} />
                 </div>
               </div>
               <div className="amazon-subnav">
                 <span>All</span>
                 <span>Today's Deals</span>
                 <span>Customer Service</span>
               </div>
               
               <div className="amazon-hero">
                  <div className="amazon-cards-grid">
                    <div className="amazon-card"><h3>Keep shopping for</h3><div className="box-placeholder"></div></div>
                    <div className="amazon-card"><h3>Top Picks</h3><div className="box-placeholder"></div></div>
                  </div>
               </div>

               {/* Amazon Modal Overlay */}
               <div className={`modal-overlay ${step >= 1 && step <= 13 ? 'active' : ''}`}>
                 <div className={`amazon-modal-container ${step >= 12 ? 'fading-out' : ''}`}>
                   <div className="amazon-modal-box shadow-soft">
                      {mode === 'login' ? (
                        // === LOGIN FORM ===
                        <>
                          <h1 className="amz-title">Sign in</h1>
                          
                          <div className={`amz-input ${step >= 2 ? 'filled' : ''} ${step === 2 && isPlaying ? 'active-typing' : ''}`}>
                            <label>Email or mobile phone number</label>
                            <input type="text" value={step >= 2 ? "user@amazon.com" : ""} readOnly />
                          </div>
                          
                          <div className={`amz-input ${step >= 3 ? 'filled' : ''} ${step === 3 && isPlaying ? 'active-typing' : ''}`}>
                            <label>Password</label>
                            <input type="password" value={step >= 3 ? "••••••••" : ""} readOnly />
                          </div>
                          
                          <button className={`amz-btn ${step >= 4 ? 'clicked' : ''}`}>
                            {step >= 5 && step < 12 ? 'Logging in...' : 'Continue'}
                          </button>
                        </>
                      ) : (
                        // === REGISTRATION FORM ===
                        <>
                          <h1 className="amz-title">Create account</h1>
                          
                          <div className={`amz-input ${step >= 2 ? 'filled' : ''} ${step === 2 && isPlaying ? 'active-typing' : ''}`}>
                            <label>Your name</label>
                            <input type="text" value={step >= 2 ? "John Doe" : ""} readOnly />
                          </div>

                          <div className={`amz-input ${step >= 2 ? 'filled' : ''} ${step === 2 && isPlaying ? 'active-typing' : ''}`}>
                            <label>Mobile number or email</label>
                            <input type="text" value={step >= 2 ? "user@amazon.com" : ""} readOnly />
                          </div>
                          
                          <div className={`amz-input ${step >= 3 ? 'filled' : ''} ${step === 3 && isPlaying ? 'active-typing' : ''}`}>
                            <label>Password</label>
                            <input type="password" value={step >= 3 ? "••••••••" : ""} placeholder="At least 6 characters" readOnly />
                          </div>
                          
                          <button className={`amz-btn ${step >= 4 ? 'clicked' : ''}`}>
                            {step >= 5 && step < 12 ? 'Creating account...' : 'Verify email'}
                          </button>
                        </>
                      )}

                      <p className="amz-terms">
                        By continuing, you agree to Amazon's Conditions of Use and Privacy Notice.
                      </p>
                   </div>
                 </div>

                 {/* AMAZON AUTHENTIC SUCCESS ALERT */}
                 <div className={`amazon-alert-success ${step >= 12 ? 'active' : ''}`}>
                   <div className="amz-alert-icon">
                     <CheckCircle2 color="#007185" size={26} strokeWidth={2} />
                   </div>
                   <div className="amz-alert-content">
                     <h4 className="amz-alert-heading">Success</h4>
                     <p>{mode === 'login' ? 'Login successful. Secure session established.' : 'Registration successful. Account created.'}</p>
                   </div>
                 </div>
               </div>
               
            </div>
          </div>

          {/* COLUMN 2: ARCHITECTURE MAP */}
          <div className="glass-panel col-arch">
            
            <h1 className="flow-mega-title">
              {mode === 'login' ? 'User Login Pipeline' : 'User Registration Pipeline'}
            </h1>
            
            <div className="arch-wrapper">
              <div className="bg-dots"></div>
              
              <svg className="network-lines" width="100%" height="100%">
                <defs>
                   <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                     <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                   </linearGradient>
                </defs>
                {/* Browser to Gateway */}
                <line x1="20%" y1="30%" x2="80%" y2="30%" className="base-line" />
                <line x1="20%" y1="30%" x2="80%" y2="30%" className={`stream-line ${step === 5 || step === 11 ? 'flowing' : ''} ${!isPlaying ? 'paused-anim' : ''}`} />
                
                {/* Gateway to Auth */}
                <line x1="80%" y1="30%" x2="80%" y2="70%" className="base-line" />
                <line x1="80%" y1="30%" x2="80%" y2="70%" className={`stream-line ${step === 6 || step === 10 ? 'flowing' : ''} ${!isPlaying ? 'paused-anim' : ''}`} />
                
                {/* Auth to DB */}
                <line x1="80%" y1="70%" x2="20%" y2="70%" className="base-line" />
                <line x1="80%" y1="70%" x2="20%" y2="70%" className={`stream-line ${step === 7 || step === 9 ? 'flowing' : ''} ${!isPlaying ? 'paused-anim' : ''}`} />
              </svg>

              {/* Microservice Nodes (Cute Pill Style) */}
              <div className={`arch-node cute-node browser ${step >= 5 && step <= 12 ? 'active' : ''}`}>
                 <div className="cute-icon-container" style={{background: 'rgba(232, 121, 249, 0.15)', color: '#e879f9'}}>
                   <Smartphone size={24} className={(step === 5 || step === 11 || step === 12) && isPlaying && !isTransitioning ? 'pulse-icon' : ''} />
                 </div>
                 <h3>Frontend App</h3>
              </div>

              <div className={`arch-node cute-node gateway ${step >= 6 && step <= 11 ? 'active' : ''}`}>
                 <div className="cute-icon-container" style={{background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8'}}>
                   <Server size={24} className={(step === 6 || step === 10) && isPlaying && !isTransitioning ? 'pulse-icon' : ''} />
                 </div>
                 <h3>API Gateway</h3>
              </div>

              <div className={`arch-node cute-node auth ${step >= 7 && step <= 10 ? 'active' : ''}`}>
                 <div className="cute-icon-container" style={{background: 'rgba(250, 204, 21, 0.15)', color: '#facc15'}}>
                   <Lock size={24} className={(step === 7 || step === 9) && isPlaying && !isTransitioning ? 'pulse-icon' : ''} />
                 </div>
                 <h3>{mode === 'login' ? 'Login Service' : 'Auth Service'}</h3>
              </div>

              <div className={`arch-node cute-node database ${step >= 8 && step <= 9 ? 'active' : ''} ${step === 9 ? 'super-active' : ''}`}>
                 <div className="cute-icon-container" style={{background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80'}}>
                   <Database size={24} className={(step === 8 || step === 9) && isPlaying && !isTransitioning ? 'bounce-icon' : ''} />
                 </div>
                 <h3>User Database</h3>
              </div>


              {/* Traveling Data Packet (Cute Sparkle/Orb) */}
              <div className={`data-packet cute-packet ${(step >= 0 && step <= 4) || step >= 13 || isTransitioning ? 'hidden' : ''} step-${step}`}>
                <div className="packet-glow"></div>
                <div className="packet-core"></div>
              </div>
              
            </div>
          </div>

          {/* COLUMN 3: LIVE EXECUTION TRACE */}
          <div className="glass-panel col-trace">
            <div className="panel-header" style={{background: 'transparent', paddingBottom: 0}}>Execution Trace</div>
            <div className="trace-wrapper" ref={traceRef}>
              <div className="trace-line"></div>
              {activeTraceSet.map((item, index) => {
                const isActive = index === activeIdx && !isTransitioning;
                const isPast = index < activeIdx && !isTransitioning;
                const isFuture = index > activeIdx || isTransitioning;
                
                return (
                  <div key={index} className={`trace-item cute-trace ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}>
                    <div className="trace-marker">
                      {isPast ? <div className="cute-check-small"><CheckCircle2 size={12} color="#fff" /></div> : <div className="dot"></div>}
                    </div>
                    <div className="trace-content">
                      <div className="trace-title">
                        {item.title}
                      </div>
                      {isActive && <div className="trace-desc">{item.desc}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
