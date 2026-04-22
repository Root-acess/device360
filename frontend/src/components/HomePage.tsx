import { motion } from 'framer-motion';
import { Clock, Eye, Truck, Star, ArrowRight, Shield, CheckCircle, Package, Settings, ThumbsUp, Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { testimonials, brands } from '../data/mockData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const usps = [
    { icon: Eye, title: 'Watch Repair LIVE', desc: 'Real-time video stream of your repair in progress' },
    { icon: Clock, title: '60-Minute Repairs', desc: 'Most repairs finished under an hour in our lab' },
    { icon: Truck, title: 'Free Doorstep Pickup', desc: 'We collect and deliver at your convenience' },
    { icon: Shield, title: '6-Month Warranty', desc: 'Every repair backed by our quality guarantee' },
  ];

  const steps = [
    { n: 1, icon: Settings, title: 'Select Repair', desc: 'Choose your device & issue' },
    { n: 2, icon: Package, title: 'Free Pickup', desc: 'Porter collects from your door' },
    { n: 3, icon: Eye, title: 'Watch LIVE', desc: 'See the repair in real-time' },
    { n: 4, icon: ThumbsUp, title: 'Quality Check', desc: 'Tested before delivery' },
    { n: 5, icon: Truck, title: 'Delivered Back', desc: 'Device returned to you' },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-sm font-medium">
                <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                4.9 Rating · 1,000+ Repairs · Bengaluru
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Mobile Repairs <br />
                <span className="text-blue-600">Done Right.</span>{' '}
                <span className="text-red-500 inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  Watched LIVE.
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed">
                India's only mobile repair service where you can watch your repair happen in real-time via live video stream. Pickup from your door, repaired in 60 minutes, delivered back.
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                {['Instant transparent pricing', 'Free doorstep pickup & delivery', 'Live video of your repair', 'No fix = No charge'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/repair')}
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:shadow-xl"
                  data-testid="check-price-button"
                >
                  Check Price Instantly
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover aspect-video" poster="https://images.unsplash.com/photo-1651493706899-72a59df915ac?w=800&h=600&fit=crop">
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-person-repairing-a-smartphone-41482-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE Repair Stream
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Avg. repair time</p>
                  <p className="font-bold text-gray-900 text-sm">42 minutes</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Live repairs today</p>
                  <p className="font-bold text-gray-900 text-sm">18 active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand logos */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">We repair all major brands</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {brands.map((b) => (
              <span key={b.id} className="text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors cursor-default" data-testid={`brand-logo-${b.id}`}>{b.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Why thousands choose Device360</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">We built the repair experience we always wanted — transparent, fast, and honest.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {usps.map((u, i) => {
              const Icon = u.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group" data-testid={`usp-card-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{u.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{u.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">Five simple steps to get your phone back — better than new.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="relative p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm" data-testid={`how-it-works-step-${s.n}`}>
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">{s.n}</div>
                  <Icon className="w-8 h-8 mx-auto mb-3 text-blue-500 mt-2" />
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Loved by customers</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}</div>
              <span className="font-bold text-gray-800">4.9 / 5</span>
              <span className="text-gray-400 text-sm">(2,847 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100" data-testid={`testimonial-${i}`}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <div className="flex">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to get your phone fixed?</h2>
          <p className="text-blue-100 text-lg mb-8">Check your price in 30 seconds. No commitments.</p>
          <button
            onClick={() => navigate('/repair')}
            className="px-10 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
            data-testid="get-quote-button"
          >
            Get Instant Quote →
          </button>
        </div>
      </section>
    </div>
  );
};
