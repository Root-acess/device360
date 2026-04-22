import type { Brand, Issue, Pricing, Testimonial } from '../types';

export const brands: Brand[] = [
  { id: 'apple', name: 'Apple', icon: 'Smartphone', models: ['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13','iPhone 12','iPhone 11'] },
  { id: 'samsung', name: 'Samsung', icon: 'Smartphone', models: ['Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy Z Fold 6','Galaxy Z Flip 6','Galaxy A54','Galaxy A34'] },
  { id: 'oneplus', name: 'OnePlus', icon: 'Smartphone', models: ['OnePlus 13 Pro','OnePlus 13','OnePlus 12','OnePlus 11','OnePlus 10 Pro','OnePlus Nord 5','OnePlus Nord 4'] },
  { id: 'xiaomi', name: 'Xiaomi', icon: 'Smartphone', models: ['Xiaomi 14 Ultra','Xiaomi 14 Pro','Xiaomi 14','Xiaomi 13 Pro','Redmi Note 13 Pro','Redmi Note 13'] },
  { id: 'vivo', name: 'Vivo', icon: 'Smartphone', models: ['Vivo X100 Pro','Vivo X100','Vivo V30 Pro','Vivo V30','Vivo Y100'] },
  { id: 'oppo', name: 'Oppo', icon: 'Smartphone', models: ['Oppo Find X7 Ultra','Oppo Reno 12 Pro','Oppo Reno 12','Oppo F25 Pro'] },
  { id: 'realme', name: 'Realme', icon: 'Smartphone', models: ['Realme GT 6','Realme 13 Pro+','Realme 13 Pro','Realme Narzo 70 Pro'] },
  { id: 'motorola', name: 'Motorola', icon: 'Smartphone', models: ['Moto Edge 50 Ultra','Moto Edge 50 Pro','Moto G85','Moto G84'] },
  { id: 'pixel', name: 'Google Pixel', icon: 'Smartphone', models: ['Pixel 9 Pro XL','Pixel 9 Pro','Pixel 9','Pixel 8 Pro','Pixel 8'] },
];

export const issues: Issue[] = [
  { id: 'screen', name: 'Screen Replacement', icon: 'Monitor', basePrice: 2999, time: '60 mins', liveRepair: true, category: 'live' },
  { id: 'battery', name: 'Battery Replacement', icon: 'Battery', basePrice: 1499, time: '60 mins', liveRepair: true, category: 'live' },
  { id: 'backglass', name: 'Back Glass', icon: 'Smartphone', basePrice: 1999, time: '60 mins', liveRepair: true, category: 'live' },
  { id: 'charging', name: 'Charging Port', icon: 'Cable', basePrice: 999, time: '2–5 hours', liveRepair: false, category: 'other' },
  { id: 'speaker', name: 'Speaker / Mic', icon: 'Volume2', basePrice: 899, time: '2–5 hours', liveRepair: false, category: 'other' },
  { id: 'camera', name: 'Camera', icon: 'Camera', basePrice: 2499, time: '2–5 hours', liveRepair: false, category: 'other' },
  { id: 'water', name: 'Water Damage', icon: 'Droplets', basePrice: 1999, time: '2–5 hours', liveRepair: false, category: 'other' },
  { id: 'motherboard', name: 'Motherboard', icon: 'Cpu', basePrice: 3999, time: '2–5 hours', liveRepair: false, category: 'other' },
];

export const testimonials: Testimonial[] = [
  { id: 1, name: 'Rahul Sharma', rating: 5, text: 'Watched my iPhone screen repair LIVE! Amazing transparency, done in 40 minutes.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 2, name: 'Priya Patel', rating: 5, text: 'The live video feature is a game changer. I could see my phone being repaired in real-time!', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 3, name: 'Amit Kumar', rating: 5, text: 'Professional team, doorstep pickup, and live tracking. Best repair service in Bengaluru!', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

export const getPriceForRepair = (brandId: string, modelName: string, issueId: string): Pricing | null => {
  const issue = issues.find((i) => i.id === issueId);
  if (!issue) return null;

  let multiplier = 1;
  if (brandId === 'apple') {
    if (modelName.includes('16 Pro Max') || modelName.includes('15 Pro Max')) multiplier = 1.8;
    else if (modelName.includes('16 Pro') || modelName.includes('15 Pro')) multiplier = 1.6;
    else if (modelName.includes('16') || modelName.includes('15')) multiplier = 1.4;
    else if (modelName.includes('14')) multiplier = 1.2;
  } else if (brandId === 'samsung') {
    if (modelName.includes('S25 Ultra') || modelName.includes('S24 Ultra')) multiplier = 1.7;
    else if (modelName.includes('Fold') || modelName.includes('Flip')) multiplier = 1.9;
    else if (modelName.includes('S25') || modelName.includes('S24')) multiplier = 1.5;
    else if (modelName.includes('S23')) multiplier = 1.3;
  } else if (brandId === 'oneplus') {
    if (modelName.includes('13 Pro')) multiplier = 1.4;
    else if (modelName.includes('13') || modelName.includes('12')) multiplier = 1.3;
    else multiplier = 1.1;
  } else if (brandId === 'xiaomi') {
    if (modelName.includes('14 Ultra')) multiplier = 1.5;
    else if (modelName.includes('14 Pro')) multiplier = 1.3;
    else multiplier = 1.1;
  } else if (brandId === 'pixel') {
    multiplier = modelName.includes('9 Pro') ? 1.4 : 1.2;
  }

  const finalPrice = Math.round(issue.basePrice * multiplier);
  return { ...issue, price: finalPrice, oldPrice: Math.round(finalPrice * 1.25) };
};
