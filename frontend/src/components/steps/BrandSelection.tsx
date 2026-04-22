import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { brands } from '../../data/mockData';
import type { StepProps } from '../../types';

const BRAND_COLORS: Record<string, string> = {
  apple: 'bg-gray-900 text-white',
  samsung: 'bg-blue-600 text-white',
  oneplus: 'bg-red-600 text-white',
  xiaomi: 'bg-orange-500 text-white',
  vivo: 'bg-blue-500 text-white',
  oppo: 'bg-green-600 text-white',
  realme: 'bg-yellow-500 text-white',
  motorola: 'bg-indigo-600 text-white',
  pixel: 'bg-teal-600 text-white',
};

export const BrandSelection: React.FC<StepProps> = ({ updateFormData, goToNextStep }) => {
  const [query, setQuery] = useState('');
  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase()) ||
    b.models.some((m) => m.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (brand: typeof brands[0]) => {
    updateFormData({ brand, model: '', issue: null, pricing: null });
    goToNextStep();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Select your brand</h2>
        <p className="text-sm text-gray-400">We support all major manufacturers</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand or model…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          data-testid="brand-search"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((brand, i) => (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(brand)}
            className="group p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 bg-white hover:shadow-md transition-all text-left"
            data-testid={`brand-card-${brand.id}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm mb-3 ${BRAND_COLORS[brand.id] || 'bg-gray-100 text-gray-700'}`}>
              {brand.name.slice(0, 2)}
            </div>
            <p className="font-bold text-gray-900 text-sm">{brand.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{brand.models.length} models</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
