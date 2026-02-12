import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Scale, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Introducere",
      icon: FileText,
      content: `Bine ați venit la CertiExpert. Acești termeni și condiții ("Termenii") guvernează utilizarea platformei noastre de învățare și pregătire pentru certificări. Prin accesarea sau utilizarea serviciilor noastre, sunteți de acord să respectați acești Termeni. Vă rugăm să îi citiți cu atenție.`
    },
    {
      title: "2. Contul Utilizatorului",
      icon: Shield,
      content: `Pentru a accesa anumite funcționalități ale platformei, trebuie să vă creați un cont. Sunteți responsabil pentru menținerea confidențialității datelor de autentificare și pentru toate activitățile care au loc în contul dumneavoastră. Vă rugăm să ne notificați imediat cu privire la orice utilizare neautorizată a contului.`
    },
    {
      title: "3. Drepturi de Proprietate Intelectuală",
      icon: Scale,
      content: `Tot conținutul prezent pe platformă, inclusiv dar fără a se limita la text, grafică, logo-uri, imagini, clipuri audio, descărcări digitale și compilații de date, este proprietatea CertiExpert sau a furnizorilor săi de conținut și este protejat de legile internaționale privind drepturile de autor.`
    },
    {
      title: "4. Utilizarea Platformei",
      icon: AlertCircle,
      content: `Vă angajați să nu utilizați platforma în scopuri ilegale sau interzise. Este strict interzisă:
      • Copierea sau redistribuirea conținutului educațional fără permisiune.
      • Încercarea de a obține acces neautorizat la sistemele noastre.
      • Harțuirea altor utilizatori sau comportamentul inadecvat în cadrul comunității.`
    },
    {
      title: "5. Limitarea Răspunderii",
      icon: AlertCircle,
      content: `CertiExpert oferă materialele de pregătire "ca atare". Deși depunem toate eforturile pentru a asigura acuratețea conținutului, nu garantăm că veți obține certificarea dorită doar prin utilizarea platformei noastre. Succesul depinde de efortul individual și de înțelegerea materiei.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1A1B1D]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Înapoi</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Termeni și Condiții</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Hero Section */}
          <div className="p-8 md:p-12 bg-primary/5 border-b border-gray-200 dark:border-gray-800 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Termeni de Utilizare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza platforma CertiExpert. Aceștia stabilesc regulile și responsabilitățile pentru utilizarea serviciilor noastre.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
                Ultima actualizare: 30 Ianuarie 2026
              </p>
            </motion.div>
          </div>

          {/* Sections */}
          <div className="p-8 md:p-12 space-y-12">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 md:pl-0"
              >
                <div className="md:flex gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-full">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-4" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 md:block">
                      <span className="md:hidden w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                        <section.icon className="w-4 h-4" />
                      </span>
                      {section.title}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer of the card */}
          <div className="bg-gray-50 dark:bg-black/20 p-8 text-center border-t border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aveți întrebări suplimentare despre termenii noștri?
            </p>
            <button className="px-6 py-2.5 bg-white dark:bg-[#25262B] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-[#2C2D32] transition-colors">
              Contactați Suportul
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
