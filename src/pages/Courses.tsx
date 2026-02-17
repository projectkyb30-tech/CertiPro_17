import React from 'react';
import { GraduationCap, FileText, Palette, Compass, MapPin, Clock, CreditCard, Wallet, Building2, Info, Mail, Globe2, CheckCircle2, ShieldCheck, AlertCircle, ClipboardList, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Courses: React.FC = () => {
  const centers = [
    {
      city: 'Chișinău',
      name: 'Centru Certiport Chișinău',
      address: 'str. Bănulescu-Bodoni 33, bloc educațional IT',
      schedule: 'Luni–Vineri: 09:00–18:00 • Sâmbătă: 10:00–14:00',
    },
    {
      city: 'Bălți',
      name: 'Centru Certiport Bălți',
      address: 'str. Ștefan cel Mare 75, etaj 2, cabinet TIC',
      schedule: 'Luni–Vineri: 09:00–17:00',
    },
    {
      city: 'Cahul',
      name: 'Centru Certiport Cahul',
      address: 'str. Ioan Vodă cel Viteaz 12, bloc liceal',
      schedule: 'Luni–Vineri: 09:00–17:00',
    },
  ];

  const certifications = [
    {
      id: 'mos',
      title: 'MOS – Microsoft Office Specialist',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
      price: '1 500–1 800 MDL / examen',
      software: 'Microsoft Office 2019, 2021, Microsoft 365 (EN/RO, după centru)',
      skills: [
        'Utilizare profesională Word, Excel, PowerPoint (nivel avansat)',
        'Formatare avansată, tabele, diagrame, formulare',
        'Funcții logice şi de analiză în Excel',
        'Pregătirea prezentărilor interactive pentru examene şi proiecte',
      ],
      duration: '45–60 minute per examen, ~35–40 itemi practici',
      recommendedHours: 'minimum 40 ore de pregătire structurată / certificare',
    },
    {
      id: 'adobe',
      title: 'Adobe Certified Professional',
      icon: Palette,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300',
      price: '1 800–2 200 MDL / examen',
      software: 'Adobe Photoshop, Illustrator, Premiere Pro – versiuni CC 2021 sau mai noi',
      skills: [
        'Editare foto la nivel profesionist (retușare, compoziție, export pentru print & web)',
        'Design vectorial pentru logo, identitate vizuală și materiale promoționale',
        'Editare video și montaj pentru social media și prezentări',
        'Respectarea standardelor de design și a brief-urilor reale',
      ],
      duration: '50–60 minute, ~30–40 întrebări și scenarii practice',
      recommendedHours: 'minimum 40–50 ore de pregătire proiect‑based',
    },
    {
      id: 'autodesk',
      title: 'Autodesk Certified User',
      icon: Compass,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300',
      price: '1 800–2 300 MDL / examen',
      software: 'Autodesk AutoCAD, Revit, Fusion 360 – versiuni 2021+',
      skills: [
        'Modelare 2D/3D pentru arhitectură, inginerie și design',
        'Citirea și realizarea planurilor tehnice',
        'Crearea de modele structurale și de vizualizare',
        'Respectarea standardelor de desen tehnic internaționale',
      ],
      duration: '50–60 minute, ~30–35 itemi practici',
      recommendedHours: 'minimum 40 ore de pregătire orientată pe proiecte reale',
    },
  ];

  return (
    <div className="space-y-10 pb-24 md:pb-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary">
            <GraduationCap className="w-4 h-4" />
            Pregătire pentru Certiport în Republica Moldova
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Courses – drumul tău sigur spre certificările{' '}
            <span className="text-primary">Certiport</span> și nota 10 la Bac.
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Această pagină reunește toate informațiile esențiale despre cursurile și examenele
            Certiport (MOS, Adobe, Autodesk) valabile în Republica Moldova pentru anul academic
            2024–2025: prețuri în MDL, centre autorizate, pași de înscriere și echivalare la Bacalaureat.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Certificări internaționale
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recunoscute de Ministerul Educației și Centrul Național de Examinare.
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>3 certificări: MOS, Adobe Certified Professional, Autodesk Certified User</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Conținut aliniat la cerințele Certiport pentru 2024–2025</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Echivalare cu nota 10 la competențe digitale la Bac</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <span>
                Informațiile au caracter orientativ. Verifică întotdeauna ultimele actualizări
                oficiale publicate de Centrul Național de Examinare și Ministerul Educației.
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Certificările disponibile și conținutul cursurilor
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Fiecare curs include module video, exerciții practice, teste de antrenament și suport
            pentru pregătirea examenului oficial Certiport.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cert.color}`}>
                <cert.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {cert.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Certificare internațională recunoscută de Certiport, dedicată elevilor și studenților
                din Republica Moldova care urmăresc performanță la Bac și în carieră.
              </p>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 flex-1">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Competențe validate
                  </p>
                  <ul className="space-y-1">
                    {cert.skills.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Versiuni software acceptate
                  </p>
                  <p>{cert.software}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Durata examenului</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cert.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Ore recomandate de pregătire
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cert.recommendedHours}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Preț orientativ</span>
                    <span className="font-semibold text-primary">{cert.price}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Sample questions & teste practice
                  </p>
                  <p>
                    Cursurile includ seturi de întrebări de tip Certiport, simulări cronometrate și
                    feedback detaliat, astfel încât elevul să ajungă confortabil peste pragul de 700/1000.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Politica de reprogramare și returnare
                  </p>
                  <p>
                    Reprogramarea examenului este posibilă, de regulă, cu minim 48 de ore înainte de data
                    stabilită. Returnarea banilor este reglementată de centrul de testare; în majoritatea
                    cazurilor se oferă reprogramare, nu rambursare integrală.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          Prețurile sunt orientative și pot varia în funcție de centrul de testare și de cursul
          valutar oficial al Băncii Naționale a Moldovei (BNM) la data achitării.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cum achiziționezi cursurile în Republica Moldova
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accesul la cursuri se face prin crearea unui cont pe platformă, selectarea certificării
            dorite și finalizarea plății prin una dintre metodele acceptate la nivel național.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">Metode de plată</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card bancar (Visa, Mastercard, inclusiv carduri salariale MDL)
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Transfer bancar în contul centrului autorizat
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Cash la centrul de examinare (Chișinău, Bălți, Cahul)
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">Pașii de achiziție</p>
              <ol className="space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Creezi cont și te conectezi pe platformă.</li>
                <li>Alegi certificarea (MOS, Adobe, Autodesk) și cursul asociat.</li>
                <li>Confirmi datele personale (nume, email, instituție).</li>
                <li>Alegi metoda de plată și finalizezi tranzacția.</li>
                <li>Primești pe email confirmarea accesului la curs și instrucțiunile de pornire.</li>
              </ol>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            După achiziție, accesul la curs este acordat, de regulă, în aceeași zi lucrătoare. Pentru
            plățile prin transfer bancar, activarea se face după confirmarea încasării.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ghid complet pentru susținerea examenelor Certiport
            </h2>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Pași concreți de înscriere
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Alegi certificarea (MOS, Adobe, Autodesk) și centrul de examinare.</li>
                <li>Completezi formularul de înscriere în centrul ales sau online.</li>
                <li>Prezinți documentele necesare și achiți taxa de examen.</li>
                <li>Primești confirmarea datei și orei examenului și instrucțiunile de prezentare.</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Documente necesare la examen
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Buletin de identitate (original).</li>
                <li>Certificat de naștere (copie, la cererea centrului sau pentru minori).</li>
                <li>Adeverință de la școală / liceu care confirmă statutul de elev (clasele 10–12).</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Perioada optimă și durata examenelor
              </p>
              <p>
                Recomandat ca elevii să susțină examenele Certiport în clasele 10–12, ideal cu cel puțin
                6–12 luni înainte de sesiunea de Bacalaureat. Durata examinărilor este, de regulă, între
                45 și 60 de minute, cu aproximativ 30–40 de întrebări și scenarii practice.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Programare online pe platforma Certiport
              </p>
              <p>
                Programarea se face prin crearea unui cont pe platforma oficială Certiport, asocierea cu
                un centru de testare din Republica Moldova și selectarea slotului de examen disponibil.
                În multe cazuri, centrele locale te ajută direct cu crearea contului și cu programarea.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Sistem de notare și prag de promovare
              </p>
              <p>
                Examenele Certiport sunt notate pe o scară de la 0 la 1000 puncte. Pentru promovare este
                necesar, în mod obișnuit, să obții cel puțin 700 de puncte. Rezultatul este afișat imediat
                după examen, iar certificatul este emis în format electronic și/sau fizic.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Strategia pentru obținerea notei 10 la Bacalaureat
            </h2>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Corelarea certificărilor cu proba de Bac
              </p>
              <p>
                Certificările MOS, Adobe Certified Professional și Autodesk Certified User pot fi
                utilizate pentru echivalarea probei de competențe digitale la Bacalaureat, în
                conformitate cu reglementările Centrului Național de Examinare pentru anul academic
                2024–2025. În special, elevii din profilurile real / informatică beneficiază direct
                de aceste certificări.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Cum se obține nota 10 prin echivalare
              </p>
              <p>
                O certificare internațională validă (MOS, Adobe sau Autodesk), obținută anterior
                sesiunii de Bac, poate fi echivalată cu nota 10 la proba de competențe digitale,
                conform procedurilor aprobate de Ministerul Educației și Centrul Național de
                Examinare. Este important ca certificatul să fie valabil la data examenului.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Documente necesare pentru echivalare
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Certificatele originale emise de Certiport (sau copii legalizate).</li>
                <li>
                  Adeverință eliberată de Centrul Național de Examinare sau de instituția de învățământ,
                  după caz.
                </li>
                <li>Cerere de echivalare depusă la instituția de învățământ / liceu.</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Termenul limită și procesul instituțional
              </p>
              <p>
                Dosarul pentru echivalare se depune, de regulă, până pe data de 15 mai a anului în
                care are loc examenul de Bacalaureat. Documentele sunt analizate de instituția de
                învățământ, apoi transmise către Ministerul Educației și Centrul Național de
                Examinare pentru confirmare oficială. Rezultatul echivalării se reflectă ulterior
                în foaia matricolă și în certificatul de Bacalaureat.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Centre de examinare Certiport în Republica Moldova
            </h2>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Examenele sunt organizate în centre autorizate Certiport. Lista de mai jos are caracter
              orientativ; pentru confirmare, verifică întotdeauna centrele active pe site-ul oficial
              Certiport sau la partenerii locali.
            </p>

            <div className="space-y-3">
              {centers.map((center) => (
                <div
                  key={center.city}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {center.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {center.city}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {center.address}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {center.schedule}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              Orarul exact și sesiunile de examinare sunt stabilite de fiecare centru; este recomandat
              să te programezi cu cel puțin 2–3 săptămâni înainte de data dorită.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Integrarea cu sistemul de plată și notificări
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cursurile sunt integrate cu un sistem de plată online care permite achitarea rapidă și
            sigură cu cardul bancar. După confirmarea plății, accesul la curs este activat automat,
            iar elevul primește notificări prin email.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Tranzacțiile sunt procesate prin procesator de plăți certificat PCI-DSS.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Datele cardului nu sunt stocate în platformă; procesarea are loc în mod securizat.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
              <span>
                Confirmările de achiziție și programările la examene sunt trimise automat pe emailul
                asociat contului.
              </span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Pentru modificarea unei programări sau clarificarea unei plăți, elevii pot contacta direct
            centrul de examinare sau echipa de suport a platformei.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Formular de contact – suport RO / RU
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ai nevoie de ajutor la alegerea certificării, programarea examenului sau echivalarea la Bac?
            Trimite-ne un mesaj în limba română sau rusă.
          </p>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Nume complet / Полное имя
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ex: Popescu Ana"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="exemplu@domeniu.md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Telefon
                </label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="+373 6xx xxx xx"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Limba preferată
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  defaultValue="ro"
                >
                  <option value="ro">Română</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Mesaj / Вопрос
              </label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Descrie pe scurt întrebarea ta sau certificarea care te interesează."
              />
            </div>

            <button
              type="submit"
              className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
            >
              <Mail className="w-4 h-4" />
              Trimite mesajul
            </button>

            <p className="text-[11px] text-gray-500 dark:text-gray-500 flex items-start gap-1.5">
              <Globe2 className="w-3 h-3 mt-0.5" />
              <span>
                Răspunsurile sunt oferite, de regulă, în 1–2 zile lucrătoare. Pentru întrebări urgente,
                contactează direct centrul de examinare ales.
              </span>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Courses;
