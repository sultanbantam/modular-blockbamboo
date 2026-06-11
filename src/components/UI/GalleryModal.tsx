import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePiStore } from '@/store/usePiStore';
import { useGameStore, BlockData } from '@/store/useGameStore';

export function GalleryModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { purchaseProfile } = usePiStore();
  const { setBlocksFromRemote } = useGameStore();
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');

  const officialBlueprints = [
    {
      id: 'house',
      title: 'Rumah Modular Bambu',
      creator: 'BlockBamboo Official',
      price: 0,
      image: '/gallery/gallery_house_1781146825628.png',
      desc: 'Desain rumah bambu modern dengan atap pelana.'
    },
    {
      id: 'cafe',
      title: 'Cafe Tropis Terbuka',
      creator: 'BlockBamboo Official',
      price: 0,
      image: '/gallery/gallery_cafe_1781146838203.png',
      desc: 'Cafe bambu ruang terbuka dengan sirkulasi udara maksimal.'
    },
    {
      id: 'school',
      title: 'Bangunan Sekolah Hijau',
      creator: 'BlockBamboo Official',
      price: 0,
      image: '/gallery/gallery_school_1781146848283.png',
      desc: 'Desain aula/sekolah hijau untuk aktivitas belajar komunal.'
    }
  ];

  const [communityBlueprints, setCommunityBlueprints] = useState([
    {
      id: 'ugc1',
      title: 'Gazebo Minimalis',
      creator: 'Pioneer_Sultan',
      price: 5,
      image: 'https://via.placeholder.com/400x300.png?text=Gazebo+Minimalis',
      desc: 'Gazebo sederhana untuk bersantai di taman belakang.'
    }
  ]);

  const handleUseBlueprint = (bp: any) => {
    if (bp.price > 0) {
      purchaseProfile(
        `blueprint_${bp.id}`, 
        bp.price, 
        () => {
          alert('Blueprint berhasil diimpor!');
          onClose();
        },
        (err) => {
          alert('Gagal membayar: ' + err.message);
        }
      );
    } else {
      alert('Blueprint berhasil dipilih (Gratis)!');
      onClose();
    }
  };

  const handleUploadClick = () => {
    const title = prompt('Masukkan nama karya desain Anda:');
    if (!title) return;
    const price = prompt('Tentukan harga Royalty (Pi):', '5');
    if (!price) return;

    setCommunityBlueprints([...communityBlueprints, {
      id: 'ugc_' + Date.now(),
      title: title,
      creator: 'You',
      price: Number(price),
      image: 'https://via.placeholder.com/400x300.png?text=Desain+Baru',
      desc: 'Desain komunitas unggahan baru.'
    }]);
    alert('Karya berhasil diunggah! Anda akan menerima '+price+' Pi setiap kali ada pemain yang mengunduhnya.');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900">
          <div>
            <h2 className="text-2xl font-bold text-amber-500">{t('galleryTitle')}</h2>
            <p className="text-stone-400 text-sm">{t('galleryDesc')}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-800 text-stone-400 hover:text-white rounded-full">
            ✕
          </button>
        </div>

        {/* Tabs & Controls */}
        <div className="flex px-6 pt-4 border-b border-stone-800 bg-stone-900/50 justify-between items-center">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('official')}
              className={`pb-3 font-bold border-b-2 transition-all ${activeTab === 'official' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              Official Blueprints
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className={`pb-3 font-bold border-b-2 transition-all ${activeTab === 'community' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              Community (UGC)
            </button>
          </div>

          <button 
            onClick={handleUploadClick}
            className="mb-3 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg text-sm flex items-center gap-2"
          >
            <span>⬆️</span> {t('uploadDesign')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-950">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'official' ? officialBlueprints : communityBlueprints).map(bp => (
              <div key={bp.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-600/50 transition-all group">
                <div className="h-48 w-full overflow-hidden bg-stone-800 relative">
                  <img src={bp.image} alt={bp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {bp.price > 0 ? (
                    <div className="absolute top-2 right-2 bg-amber-900/80 backdrop-blur text-amber-400 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-amber-500/50">
                      <span>💎</span> {bp.price} Pi
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-green-900/80 backdrop-blur text-green-400 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-green-500/50">
                      Gratis
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-stone-200 text-lg">{bp.title}</h3>
                  <p className="text-xs text-amber-600/70 mb-3 font-mono">By: {bp.creator}</p>
                  <p className="text-stone-400 text-sm mb-4 line-clamp-2">{bp.desc}</p>
                  
                  <button 
                    onClick={() => handleUseBlueprint(bp)}
                    className="w-full py-2 bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-300 font-bold rounded transition-colors"
                  >
                    {bp.price > 0 ? `Beli & Gunakan` : 'Gunakan Blueprint'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
