import { useState, useEffect } from 'react';

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeen = localStorage.getItem('blockbamboo-tutorial-seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('blockbamboo-tutorial-seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slides = [
    {
      title: "Selamat Datang di BlockBamboo! 🌿",
      content: (
        <div className="space-y-3">
          <p>BlockBamboo adalah **Web3 Social Builder Game** eksklusif untuk Ekosistem Pi Network.</p>
          <p>Di sini, Anda akan belajar menyusun purwarupa rumah bambu modular yang ramah lingkungan secara 3D.</p>
          <div className="bg-amber-900/30 p-3 rounded border border-amber-800">
            <strong>Misi Anda:</strong> Bangun rumah impian, kumpulkan XP, naikkan level profesi *Undagi*, dan kolaborasi dengan Pioneer lain!
          </div>
        </div>
      ),
      icon: "🏠"
    },
    {
      title: "Cara Bermain 🎮",
      content: (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-2">
            <li>Pilih blok/profil bambu dari <strong>Katalog</strong> di sebelah kiri.</li>
            <li>Klik kiri di area tengah (titik <em>Snap</em> merah) untuk menempatkan blok.</li>
            <li>Susun blok saling mengunci (<em>interlocking</em>) untuk mendapatkan bonus XP berlipat ganda!</li>
            <li>Klik Kanan pada blok yang sudah ditaruh untuk menghapus atau menyesuaikan posisinya.</li>
            <li>Gunakan <strong>Mouse</strong> (Klik + Geser) atau tombol <strong>W/A/S/D</strong> untuk memutar dan menggerakkan kamera.</li>
          </ul>
        </div>
      ),
      icon: "🖱️"
    },
    {
      title: "Ekosistem Web3 & Multiplayer 🌐",
      content: (
        <div className="space-y-3">
          <p>BlockBamboo bukan sekadar mainan sendiri. Anda bisa mengundang teman untuk membangun bersama (Co-Op)!</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Gunakan fitur <strong>Multiplayer</strong> di menu atas untuk membuat ruangan (Room).</li>
            <li>Bagikan nama Room ke teman Anda. Mereka akan langsung muncul di kanvas Anda secara <em>Real-Time</em>.</li>
            <li>Gunakan fitur <strong>Kas Proyek / Donasi Pi</strong> untuk menggalang dana (*Prize Pool*) bersama tim Anda menggunakan Pi Wallet.</li>
            <li>Anda juga bisa mengobrol (Chat) langsung di dalam game.</li>
          </ul>
        </div>
      ),
      icon: "🤝"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col min-h-[400px]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-green-500 flex items-center gap-3">
            <span className="text-3xl">{slides[step].icon}</span>
            {slides[step].title}
          </h2>
          <button 
            onClick={closeTutorial}
            className="text-stone-500 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="text-stone-300 text-sm md:text-base leading-relaxed flex-1">
          {slides[step].content}
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-stone-800">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-green-500' : 'w-2 bg-stone-700'}`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-bold"
              >
                Kembali
              </button>
            )}
            
            {step < slides.length - 1 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg"
              >
                Lanjut
              </button>
            ) : (
              <button 
                onClick={closeTutorial}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold shadow-lg"
              >
                Mulai Membangun!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
