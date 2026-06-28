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
      title: <span className="whitespace-nowrap text-lg md:text-xl">🚀 Selamat Datang di enPIneering! 🌿</span>,
      content: (
        <div className="space-y-3">
          <div className="flex justify-center mb-2">
            <img src="/logo2.png" alt="enPIneering Logo" className="h-40 w-auto drop-shadow-lg object-contain" />
          </div>
          <p className="font-bold text-center text-amber-500 text-sm md:text-base">Dunia tempat para Pioneer menjadi Builder Masa Depan</p>
          <p className="text-center italic text-stone-400 text-sm">Bangun. Berkreasi. Berkolaborasi.</p>
          <p className="text-sm md:text-base text-center">Di enPIneering, setiap struktur yang Anda ciptakan adalah langkah menuju masa depan konstruksi yang lebih cerdas, modular, dan ramah lingkungan.</p>
          <div className="bg-amber-900/30 p-3 rounded border border-amber-800 text-sm">
            <strong className="block mb-2 text-amber-400">🎯 Misi Anda</strong>
            <ul className="space-y-1">
              <li>🏗 Bangun rumah impian dan kumpulkan XP</li>
              <li>⭐ Tingkatkan level profesi Builder Anda</li>
              <li>🤝 Bekerja sama dengan Pioneer dari seluruh dunia</li>
              <li>🌎 Wujudkan ekosistem konstruksi hijau berbasis Pi Network</li>
            </ul>
          </div>
          <p className="text-center font-bold text-green-500 text-sm">💚 Sendirian kita membangun rumah, bersama kita membangun peradaban.</p>
          <p className="text-xs text-center text-stone-400">Undang teman dan sesama Pioneer untuk bergabung, dan jadilah bagian dari generasi pertama Builder enPIneering!</p>
          <p className="text-center font-bold tracking-widest text-stone-500 mt-2 text-xs">Build • Connect • Earn</p>
        </div>
      ),
      icon: ""
    },
    {
      title: <span className="whitespace-nowrap">Cara Bermain 🎮</span>,
      content: (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li>Pilih blok/profil bambu dari <strong>Katalog</strong> di sebelah kiri.</li>
            <li><strong>Desktop:</strong> Klik kiri di area tengah (titik <em>Snap</em> merah) untuk menempatkan blok.</li>
            <li><strong>HP / Tablet:</strong> Sentuh (Tap) pada area snap untuk menempatkan blok. Gunakan dua jari (Pinch) untuk Zoom, dan geser dengan satu jari untuk memutar kamera.</li>
            <li>Susun blok saling mengunci (<em>interlocking</em>) untuk mendapatkan bonus XP berlipat ganda!</li>
            <li>Klik Kanan (atau Tahan/Long Press di HP) pada blok yang sudah ditaruh untuk menghapus atau menyesuaikan posisinya.</li>
            <li>Gunakan <strong>Mouse</strong> (Klik + Geser) atau tombol <strong>W/A/S/D</strong> untuk memutar dan menggerakkan kamera.</li>
          </ul>
        </div>
      ),
      icon: "🖱️"
    },
    {
      title: <span className="whitespace-nowrap text-lg md:text-xl">Ekosistem Web3 & Multiplayer 🌐</span>,
      content: (
        <div className="space-y-3">
          <p className="text-sm md:text-base">enPIneering bukan sekadar mainan sendiri. Anda bisa mengundang teman untuk membangun bersama (Co-Op)!</p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li>Gunakan fitur <strong>Multiplayer</strong> di menu atas untuk membuat ruangan (Room).</li>
            <li>Bagikan nama Room ke teman Anda. Mereka akan langsung muncul di kanvas Anda secara <em>Real-Time</em>.</li>
            <li>Gunakan fitur <strong>Kas Proyek / Donasi Pi / Donasi BMC</strong> untuk menggalang dana (*Prize Pool*) bersama tim Anda menggunakan Pi/BMC Wallet.</li>
            <li>Anda juga bisa mengobrol (Chat) langsung di dalam game.</li>
          </ul>
        </div>
      ),
      icon: "🤝"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl p-4 md:p-6 relative flex flex-col">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-green-500 leading-snug">
            {slides[step].icon && <span className="inline-block mr-2 text-2xl md:text-3xl align-middle">{slides[step].icon}</span>}
            <span className="align-middle">{slides[step].title}</span>
          </h2>
          <button 
            onClick={closeTutorial}
            className="text-stone-500 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="text-stone-300 text-sm md:text-base leading-relaxed flex-1 overflow-y-auto pr-2 min-h-0">
          {slides[step].content}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-800 shrink-0">
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
