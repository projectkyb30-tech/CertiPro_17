import { Step } from 'react-joyride';
import { ROUTES } from '../../../routes/paths';

/**
 * Generate the steps for the application tutorial.
 * 
 * @param isMobile - Boolean indicating if the current viewport is mobile width (<768px).
 * @returns Array of Step objects compatible with react-joyride.
 */
export const getTutorialSteps = (isMobile: boolean): Step[] => [
  // --- HOME PAGE ---
  {
    target: 'body',
    content: (
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">Bine ai venit în CertiExpert! 🚀</h3>
        <p>Hai să facem un tur complet al aplicației pentru a te familiariza cu toate funcționalitățile.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
    data: { route: ROUTES.HOME },
  },
  ...(isMobile ? [{
    target: '#mobile-nav',
    content: (
      <div>
        <h4 className="font-bold mb-1">Meniu Navigare</h4>
        <p>Folosește acest meniu pentru a naviga rapid între secțiunile aplicației.</p>
      </div>
    ),
    placement: 'top' as const,
    data: { route: ROUTES.HOME },
  }] : [{
    target: '#sidebar-nav',
    content: (
      <div>
        <h4 className="font-bold mb-1">Navigare Principală</h4>
        <p>Aici ai acces rapid la toate modulele: Lecții, Progres și Setări.</p>
      </div>
    ),
    placement: 'right' as const,
    data: { route: ROUTES.HOME },
  }]),
  {
    target: '#daily-focus',
    content: (
      <div>
        <h4 className="font-bold mb-1">Focus Zilnic</h4>
        <p>Aici vei găsi obiectivele tale pentru ziua curentă. Menține seria activă pentru bonusuri!</p>
      </div>
    ),
    placement: 'bottom',
    data: { route: ROUTES.HOME },
  },
  {
    target: '#courses-grid',
    content: (
      <div>
        <h4 className="font-bold mb-1">Cursurile Tale</h4>
        <p>Lista cursurilor active. Dă click pe un curs pentru a continua învățarea.</p>
      </div>
    ),
    placement: 'top',
    data: { route: ROUTES.HOME },
  },
  {
    target: '#header-profile',
    content: (
      <div>
        <h4 className="font-bold mb-1">Profil Rapid</h4>
        <p>Vezi nivelul tău actual și accesează rapid setările contului.</p>
      </div>
    ),
    placement: 'bottom',
    data: { route: ROUTES.HOME },
  },

  // --- LESSONS PAGE ---
  {
    target: 'body',
    content: (
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">Secțiunea Lecții 📚</h3>
        <p>Aici se întâmplă magia! Hai să explorăm planul tău de învățare.</p>
      </div>
    ),
    placement: 'center',
    data: { route: ROUTES.LESSONS },
  },
  {
    target: '#course-tabs',
    content: (
      <div>
        <h4 className="font-bold mb-1">Selectare Curs</h4>
        <p>Comută ușor între cursurile disponibile. Cursurile blocate se vor dechide pe măsură ce progresezi.</p>
      </div>
    ),
    placement: 'bottom',
    data: { route: ROUTES.LESSONS },
  },
  {
    target: '#learning-map',
    content: (
      <div>
        <h4 className="font-bold mb-1">Harta de Învățare</h4>
        <p>Urmează traseul interactiv. Lecțiile sunt deblocate secvențial pentru a asigura o învățare structurată.</p>
      </div>
    ),
    placement: 'top',
    data: { route: ROUTES.LESSONS },
  },

  // --- PROGRESS PAGE ---
  {
    target: 'body',
    content: (
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">Secțiunea Progres 📈</h3>
        <p>Urmărește-ți evoluția și vezi cât de aproape ești de certificare.</p>
      </div>
    ),
    placement: 'center',
    data: { route: ROUTES.HOME },
  },
  {
    target: '#stats-overview',
    content: (
      <div>
        <h4 className="font-bold mb-1">Statistici Generale</h4>
        <p>XP-ul acumulat, seria de zile consecutive (Streak) și activitatea de astăzi.</p>
      </div>
    ),
    placement: 'bottom',
    data: { route: ROUTES.HOME },
  },
  {
    target: '#stats-details',
    content: (
      <div>
        <h4 className="font-bold mb-1">Detalii Progres</h4>
        <p>O privire de ansamblu asupra cursurilor finalizate și a timpului investit.</p>
      </div>
    ),
    placement: 'top',
    data: { route: ROUTES.HOME },
  },
  {
    target: '#courses-progress-list',
    content: (
      <div>
        <h4 className="font-bold mb-1">Progres pe Curs</h4>
        <p>Vezi exact cât la sută ai completat din fiecare curs în parte.</p>
      </div>
    ),
    placement: 'top',
    data: { route: ROUTES.HOME },
  },

  // --- SETTINGS PAGE ---
  {
    target: 'body',
    content: (
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">Setări ⚙️</h3>
        <p>Configurează aplicația după preferințele tale.</p>
      </div>
    ),
    placement: 'center',
    data: { route: ROUTES.SETTINGS },
  },
  {
    target: 'main', // Target the main content area of settings
    content: (
      <div>
        <h4 className="font-bold mb-1">Opțiuni Disponibile</h4>
        <p>Editează profilul, schimbă tema (Dark/Light), limba sau gestionează notificările.</p>
      </div>
    ),
    placement: 'center',
    data: { route: ROUTES.SETTINGS },
  },
  
  // --- FINAL ---
  {
    target: 'body',
    content: (
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">Felicitări! 🎉</h3>
        <p>Ai finalizat turul aplicației. Acum ești gata să începi drumul spre certificare!</p>
        <p className="text-sm text-gray-500 mt-2">Poți relua acest tutorial oricând din Setări.</p>
      </div>
    ),
    placement: 'center',
    data: { route: ROUTES.HOME }, // Go back home for the finish
  }
];
