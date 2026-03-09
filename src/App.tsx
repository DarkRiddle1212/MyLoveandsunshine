import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { 
  Heart, 
  Camera, 
  Music, 
  Pause, 
  Play, 
  Gift, 
  ChevronDown, 
  Star, 
  Sparkles,
  Upload,
  X
} from 'lucide-react';

// --- Types ---
interface Reason {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Photo {
  id: string;
  url: string;
}

// --- Constants ---
const REASONS: Reason[] = [
  { id: 1, title: "Your Smile", description: "The way your face lights up can brighten even my darkest days.", icon: <Sparkles className="w-6 h-6 text-romantic-rose" /> },
  { id: 2, title: "Your Kindness", description: "You have the biggest heart I've ever known, always putting others first.", icon: <Heart className="w-6 h-6 text-romantic-rose" /> },
  { id: 3, title: "Your Strength", description: "I admire how you handle every challenge with grace and determination.", icon: <Star className="w-6 h-6 text-romantic-rose" /> },
  { id: 4, title: "Your Laugh", description: "It's my favorite sound in the world, pure music to my ears.", icon: <Music className="w-6 h-6 text-romantic-rose" /> },
  { id: 5, title: "Your Intelligence", description: "I love our deep conversations and how you see the world so uniquely.", icon: <Sparkles className="w-6 h-6 text-romantic-rose" /> },
  { id: 6, title: "Your Support", description: "You are my biggest cheerleader and my safest place to land.", icon: <Heart className="w-6 h-6 text-romantic-rose" /> },
  { id: 7, title: "Your Beauty", description: "Inside and out, you are the most stunning person I've ever met.", icon: <Star className="w-6 h-6 text-romantic-rose" /> },
  { id: 8, title: "Just Being You", description: "There is nobody else in the world like you, and I'm the luckiest to have you.", icon: <Heart className="w-6 h-6 text-romantic-rose" /> },
];

const BIRTHDAY_DATE = new Date('2026-03-20T00:00:00'); // Example date, user can adjust

// --- Components ---

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-particle text-romantic-rose/20"
          style={{
            left: heart.left,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            bottom: '-50px',
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [name, setName] = useState<string>('');
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'love') { // Simple password
      setIsAdmin(true);
      setShowAdminLogin(false);
      localStorage.setItem('is_birthday_admin', 'true');
    } else {
      alert('Incorrect password ❤️');
    }
  };

  // Check for admin mode and load photos from API
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLocalAdmin = localStorage.getItem('is_birthday_admin') === 'true';
    if (params.get('admin') === 'true' || isLocalAdmin) {
      setIsAdmin(true);
    }

    const fetchPhotos = async () => {
      setIsLoadingPhotos(true);
      setPhotoError(null);
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);
        
        if (error) throw error;
        if (data) setPhotos(data);
      } catch (err: any) {
        console.error("Failed to fetch photos:", err);
        setPhotoError(err.message || "Failed to load photos. Please check your Supabase connection.");
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();

    const savedName = localStorage.getItem('birthday_girl_name');
    if (savedName) {
      setName(savedName);
      setIsNameEntered(true);
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName === 'favour' || trimmedName === 'favor') {
      setIsNameEntered(true);
      setNameError(null);
      localStorage.setItem('birthday_girl_name', name);
      
      // Start music on successful "login"
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked or failed:", err);
        });
      }
    } else {
      setNameError("Oops! That's not the name of the birthday girl I'm looking for... ❤️");
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to 0.7 quality to significantly reduce size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsLoadingPhotos(true);
      for (const file of Array.from(files)) {
        try {
          const compressedUrl = await compressImage(file as File);
          const newPhoto = { 
            id: Date.now().toString() + Math.random(), 
            url: compressedUrl 
          };
          
          const { error } = await supabase
            .from('photos')
            .insert([newPhoto]);
          
          if (error) throw error;
          setPhotos(prev => [newPhoto, ...prev]);
        } catch (err) {
          console.error("Failed to upload photo:", err);
          alert("Failed to upload one of the photos. It might be too large.");
        }
      }
      setIsLoadingPhotos(false);
    }
  };

  const clearAllPhotos = async () => {
    if (!window.confirm("Are you sure you want to delete ALL photos? This cannot be undone. ❤️")) return;
    
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .neq('id', '0'); // Delete everything
      
      if (error) throw error;
      setPhotos([]);
      alert("All photos cleared! You can now upload new ones. ✨");
    } catch (err) {
      console.error("Failed to clear photos:", err);
      alert("Failed to clear photos. Please try again.");
    }
  };

  const removePhoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isNameEntered) {
    return (
      <div className="min-h-screen bg-romantic-cream flex items-center justify-center p-6">
        <FloatingHearts />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 md:p-12 rounded-3xl max-w-md w-full text-center relative z-10"
        >
          <Heart className="w-12 h-12 text-romantic-rose mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-display font-bold text-stone-800 mb-4">Welcome, Beautiful</h1>
          <p className="text-stone-600 mb-8 font-serif italic">Please enter your name to unlock your birthday surprise...</p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Your Name"
                className={`w-full px-6 py-4 rounded-full border-2 outline-none transition-colors text-center text-lg ${
                  nameError ? 'border-red-300 focus:border-red-400' : 'border-romantic-pink focus:border-romantic-rose'
                }`}
                autoFocus
              />
              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm font-serif italic"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <button
              type="submit"
              className="w-full bg-romantic-rose text-white py-4 rounded-full font-bold shadow-lg hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95"
            >
              Unlock My Surprise ✨
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-romantic-cream selection:bg-romantic-pink selection:text-romantic-rose overflow-x-hidden">
      <FloatingHearts />
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" // Updated to a different track, user can replace with Vance Joy link
        loop 
      />

      {/* Floating Music Control */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-8 right-8 z-50 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-romantic-rose hover:scale-110 transition-transform border border-romantic-pink"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Music className="w-6 h-6" />}
      </button>

      {/* Top Reset Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            localStorage.removeItem('birthday_girl_name');
            window.location.reload();
          }}
          className="p-2 text-stone-400 hover:text-romantic-rose transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-medium glass-card rounded-full px-4"
        >
          <X className="w-4 h-4" />
          <span>Reset Name</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="w-16 h-16 text-romantic-rose fill-romantic-rose" />
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-display font-bold text-stone-800 mb-6 leading-tight">
            Happy Birthday <br />
            <span className="gold-gradient">{name}</span> ❤️
          </h1>
          <button 
            onClick={() => {
              localStorage.removeItem('birthday_girl_name');
              window.location.reload();
            }}
            className="text-xs text-stone-400 hover:text-romantic-rose transition-colors mb-8 uppercase tracking-widest cursor-pointer"
          >
            Not {name}? Click to change name
          </button>
          <p className="text-xl md:text-2xl font-serif italic text-stone-600 max-w-2xl mx-auto mb-12">
            "Today we celebrate the most amazing person in my life. You are my dream come true."
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            {!isPlaying && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleMusic}
                className="flex items-center gap-2 px-6 py-3 bg-romantic-rose/10 text-romantic-rose border border-romantic-rose/20 rounded-full font-medium hover:bg-romantic-rose/20 transition-all mb-4"
              >
                <Music className="w-5 h-5" />
                <span>Start the Magic ✨</span>
              </motion.button>
            )}
            <p className="text-sm uppercase tracking-[0.3em] text-romantic-rose mb-4 font-bold animate-pulse">It's your special day! 🎂</p>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-16"
          >
            <ChevronDown className="w-8 h-8 text-stone-300 mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* Message Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 rounded-[3rem] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-romantic-pink via-romantic-rose to-romantic-pink" />
          <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-800 mb-8">A Message For You</h2>
          <div className="space-y-6 text-lg md:text-xl font-serif leading-relaxed text-stone-700 italic">
            <p>Happy birthday my love ❤️</p>
            <p>
              Today is all about celebrating you and the beautiful soul you are. You bring so much joy, warmth, and light into my life in ways I never expected. Every moment with you feels special, and every memory we create together means the world to me.
            </p>
            <p>
              I just want you to know I love you more as each day pass by. Being with you has shown me how amazing love can truly feel, and I’m grateful for you every single day.
            </p>
            <p>
              I hope today reminds you how deeply you are loved and appreciated. May this new year of your life bring you happiness, peace, and all the beautiful things your heart desires.
            </p>
            <p className="pt-6 font-display text-2xl text-romantic-rose">Happy birthday once again, my love. 💖</p>
          </div>
        </motion.div>
      </section>

      {/* Reasons Section */}
      <section className="py-24 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-800 mb-4">Reasons I Love You</h2>
            <p className="text-stone-500 font-serif italic">Just a few of the million things that make you special...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {REASONS.map((reason, index) => (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-romantic-pink/30 text-center flex flex-col items-center"
              >
                <div className="mb-4 p-3 bg-romantic-pink/20 rounded-2xl">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-stone-800 mb-3">{reason.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-800 mb-4">Our Memory Gallery</h2>
          <p className="text-stone-500 font-serif italic mb-8">A collection of our most beautiful moments</p>
          
          {isAdmin && (
            <div className="mb-12 p-6 glass-card rounded-3xl inline-block">
              <p className="text-sm text-romantic-rose font-bold mb-4 uppercase tracking-widest">Admin Mode: Upload Photos</p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <label className="inline-flex items-center gap-2 px-8 py-4 bg-romantic-rose text-white rounded-full font-bold shadow-lg cursor-pointer hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95">
                  <Upload className="w-5 h-5" />
                  <span>Upload Memories</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <button 
                  onClick={clearAllPhotos}
                  className="px-6 py-4 text-romantic-rose/60 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  Clear All Photos
                </button>
              </div>
              <p className="mt-4 text-[10px] text-stone-400 italic">Images are now automatically compressed to save space ✨</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingPhotos && (
            <div className="col-span-full py-20 text-center">
              <div className="w-12 h-12 border-4 border-romantic-pink border-t-romantic-rose rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-400 font-serif italic">Loading our memories...</p>
            </div>
          )}

          {photoError && (
            <div className="col-span-full py-10 px-6 bg-red-50 border border-red-100 rounded-3xl text-center">
              <p className="text-red-500 font-serif italic mb-4">{photoError}</p>
              <div className="flex flex-col gap-3 items-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-white border border-red-200 rounded-full text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Try refreshing the page
                </button>
                {isAdmin && (
                  <button 
                    onClick={clearAllPhotos}
                    className="text-romantic-rose underline text-xs font-bold mt-2"
                  >
                    Force Clear All Photos (Fixes Timeout)
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoadingPhotos && !photoError && (
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square rounded-3xl overflow-hidden shadow-md group"
                >
                  <img 
                    src={photo.url} 
                    alt="Memory" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => removePhoto(photo.id)}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {!isLoadingPhotos && !photoError && photos.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-romantic-pink rounded-3xl text-stone-400 font-serif italic">
              {isAdmin ? "No memories uploaded yet. Start by adding some photos!" : "Our beautiful memories will appear here soon..."}
            </div>
          )}
        </div>
      </section>

      {/* Surprise Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-stone-800 mb-8">One More Thing...</h2>
          <button
            onClick={() => setShowSurprise(!showSurprise)}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-stone-800 text-white rounded-full font-bold shadow-2xl hover:bg-stone-900 transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Gift className="w-6 h-6" />
              {showSurprise ? "Hide the Surprise" : "Click for a Surprise 🎁"}
            </span>
            <motion.div 
              className="absolute inset-0 bg-romantic-rose opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </button>

          <AnimatePresence>
            {showSurprise && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="mt-12 p-10 glass-card rounded-[2.5rem] relative"
              >
                <Sparkles className="w-10 h-10 text-romantic-gold mx-auto mb-6" />
                <p className="text-2xl md:text-3xl font-display font-bold text-romantic-rose mb-4">
                  Surprise! 🌹
                </p>
                <p className="text-xl font-serif italic text-stone-700 leading-relaxed">
                  "I know you've always wanted to change your phone but I am giving you a promise as a gift. Before the month ends or latest next month. Be patient with this struggling boy ❤️"
                </p>
                <div className="mt-8 flex justify-center gap-2">
                  <Heart className="w-6 h-6 text-romantic-rose fill-romantic-rose" />
                  <Heart className="w-6 h-6 text-romantic-rose fill-romantic-rose" />
                  <Heart className="w-6 h-6 text-romantic-rose fill-romantic-rose" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Final Section */}
      <section className="py-32 px-6 text-center bg-gradient-to-b from-romantic-cream to-romantic-pink/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-7xl font-display font-bold text-stone-800 mb-8 leading-tight">
            You Make My World <br />
            <span className="text-romantic-rose">Beautiful 💖</span>
          </h2>
          <p className="text-xl font-serif italic text-stone-500 mb-12">
            Thank you for being you. Happy Birthday, my love.
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-romantic-pink">
              <Heart className="w-6 h-6 text-romantic-rose" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-romantic-pink">
              <Star className="w-6 h-6 text-romantic-gold" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-romantic-pink">
              <Sparkles className="w-6 h-6 text-romantic-rose" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-stone-400 text-sm font-serif border-t border-romantic-pink/20">
        <p className="mb-4">Made with all my love for {name} • 2026</p>
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => {
              localStorage.removeItem('birthday_girl_name');
              window.location.reload();
            }}
            className="text-romantic-rose/60 hover:text-romantic-rose transition-colors underline underline-offset-4 cursor-pointer"
          >
            Reset Name
          </button>
          {!isAdmin && (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-stone-300 hover:text-romantic-rose transition-colors cursor-pointer"
            >
              Admin
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => {
                setIsAdmin(false);
                localStorage.removeItem('is_birthday_admin');
              }}
              className="text-romantic-rose hover:text-pink-600 transition-colors cursor-pointer font-bold"
            >
              Exit Admin Mode
            </button>
          )}
        </div>

        {/* Admin Login Modal */}
        <AnimatePresence>
          {showAdminLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
              >
                <Camera className="w-12 h-12 text-romantic-rose mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-stone-800 mb-2">Admin Access</h3>
                <p className="text-stone-500 text-sm mb-6">Enter password to upload photos</p>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl border border-romantic-pink outline-none text-center"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(false)}
                      className="flex-1 py-3 text-stone-400 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-romantic-rose text-white py-3 rounded-xl font-bold shadow-md"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}
