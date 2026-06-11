import { useGameStore } from '@/store/useGameStore';
import { TRANSLATIONS } from '@/store/translations';

export function useTranslation() {
  const language = useGameStore((state) => state.language);
  const t = (key: keyof typeof TRANSLATIONS.id, params?: Record<string, string | number>) => {
    let str = TRANSLATIONS[language][key] || TRANSLATIONS.id[key] || key;
    
    if (params) {
      Object.keys(params).forEach(p => {
        str = str.replace(`{${p}}`, params[p].toString());
      });
    }
    return str;
  };

  return { t, language };
}
