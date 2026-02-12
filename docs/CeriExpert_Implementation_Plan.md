# Plan Detaliat de Implementare CeriExpert (Frontend & Arhitectură)

Acest document detaliază etapele de dezvoltare pentru platforma CeriExpert, concentrându-se pe infrastructură, interfață și logica aplicației (fără conținutul efectiv al cursurilor), conform specificațiilor din documentația de proiect și design.

## 1. Analiza Cerințelor & Scopului
*   **Obiectiv**: Platformă LMS (Learning Management System) pentru certificări Certiport.
*   **Stare actuală**: Prototipare și Dezvoltare MVP (Interfață + Logică).
*   **Target**: Web (Desktop & Mobile Responsive).
*   **Referințe**: `CeriExpert_Complete_Documentation.md`, `CeriExpert_Visual_Design.md`.

---

## 2. Structura Learning Path (Model de Date)
Definirea structurii ierarhice a datelor pentru a susține funcționalitatea de "Course Locking" și "Progress Tracking".

### Ierarhia Conținutului
1.  **Program/Track** (ex: "IT Specialist")
    *   Conține multiple Cursuri.
2.  **Curs** (ex: "Python Programming")
    *   Metadata: Titlu, Descriere, Preț, Icon, Durată.
    *   Status: Locked/Unlocked (bazat pe achiziție).
3.  **Modul** (ex: "Data Types")
    *   Grupare logică a lecțiilor.
    *   Stare vizuală: Expandat/Colapsat.
4.  **Lecție** (ex: "Lists Operations")
    *   Tipuri: Teorie (Markdown/Text), Quiz (Grilă), Practică (Code Editor/Snippet).
    *   Dependențe: Lecția N necesită Lecția N-1 completată.
    *   Status: Locked, In Progress, Completed.

### Criterii de Progresie
*   **Deblocare Lecție**: Completarea cu succes (scor > 70% la quiz) a lecției anterioare.
*   **Deblocare Modul**: Automat la deblocarea primei lecții din modul.
*   **Certificat**: Generat la 100% completare curs.

---

## 3. Arhitectura Sistemului (Frontend-First)
Deoarece backend-ul nu este specificat explicit, vom construi o arhitectură "Frontend cu Mock Services" care să permită conectarea ușoară la un API real ulterior.

### 3.1 Stack Tehnologic
*   **Core**: React 18, TypeScript.
*   **Build Tool**: Vite.
*   **State Management**: Zustand (pentru User Session, Course Progress, UI State).
*   **Styling**: Tailwind CSS (conform Design System).
*   **Routing**: React Router v6 (cu Protected Routes).
*   **UI Components**: Headless UI + Componente Custom.
*   **Icons**: Lucide React.
*   **Animations**: Framer Motion (pentru "Code Rain" și tranziții).

### 3.2 Structura Datelor (Mock DB / Interfaces)
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  streak: number;
  xp: number;
}

interface CourseProgress {
  courseId: string;
  lessonsCompleted: string[]; // IDs
  quizScores: Record<string, number>; // lessonId -> score
  lastAccessedLessonId: string;
}
```

---

## 4. UI/UX Design & Implementare
Implementarea fidelă a wireframe-urilor din `CeriExpert_Visual_Design.md`.

### 4.1 Design System (Global)
*   **Culori**: Definire variabile CSS/Tailwind config pentru temele Light/Dark (Blue Primary #0066FF).
*   **Tipografie**: Integrare fonturi `Inter` și `JetBrains Mono`.
*   **Componente de Bază (Atoms)**:
    *   `Button` (Primary, Secondary, Ghost).
    *   `Input` (Text, Password, OTP).
    *   `Card` (Container cu shadow/border).
    *   `Badge` (Status indicators).
    *   `ProgressBar` (Circular & Linear).

### 4.2 Pagini și Fluxuri (Views)
1.  **Public / Onboarding**:
    *   `WelcomeScreen`: Animație "Code Rain".
    *   `TutorialScreen`: Swiper cu 3 slide-uri (Graduation, Learn, AI).
2.  **Auth**:
    *   `Login / Register`: Formulare cu validare.
    *   `OTPVerification`: Input numeric divizat, timer.
3.  **Dashboard**:
    *   `Home`: Widget progres, Lista cursuri (Grid), "Continue Learning".
    *   `Sidebar/Navbar`: Navigație responsivă.
4.  **Learning Experience**:
    *   `CourseOverview`: Lista modulelor (Accordion), status lecții (Lock/Check).
    *   `LessonView`: Layout cu Sidebar (cuprins) și Main Content (Teorie/Quiz).

---

## 5. Implementare Infrastructură (Setup)
*   **Săptămâna 1 - Ziua 1**:
    1.  Initializare proiect Vite + TS.
    2.  Configurare Tailwind (colors, fonts).
    3.  Setup Eslint/Prettier.
    4.  Creare structură foldere:
        *   `/src/components` (atoms, molecules, organisms)
        *   `/src/pages`
        *   `/src/store` (Zustand)
        *   `/src/services` (Mock API)
        *   `/src/assets`
        *   `/src/types`

---

## 6. Dezvoltare Funcționalități Core
*   **Navigație**: Configurare Router, Layout-uri (AuthLayout vs AppLayout).
*   **Auth Simulation**: Store pentru a reține starea "Logat/Nelogat" și datele utilizatorului.
*   **Progress Engine**:
    *   Serviciu care calculează % de finalizare.
    *   Logica de "Locking" (verificare recursivă a dependențelor).
*   **Notifications**: Sistem "Toast" pentru feedback (ex: "Răspuns corect", "Autentificare reușită").

---

## 7. Integrări Externe (Simulate/Prepared)
*   **Payment**: Interfață abstractă `PaymentService`. Implementare Mock care transformă un curs din "Locked" în "Unlocked" la apăsarea unui buton "Buy (Dev Mode)".
*   **AI Assistant**: Componentă UI de Chat (Floating Button). Integrare mock pentru demo.

---

## 8. Strategie de Testare
*   **Unit Testing**: Vitest pentru logica de calcul a progresului și validarea formularelor.
*   **UI Testing**: Verificare manuală a responsivității (Mobile/Tablet/Desktop).
*   **Performance**: Audit Lighthouse pentru viteza de încărcare (target > 90).

---

## 9. Documentație Tehnică
*   **README.md**: Instrucțiuni de instalare și rulare.
*   **Architecture.md**: Diagrama fluxului de date.
*   **Code Comments**: JSDoc pentru funcțiile complexe (ex: calculatorul de progres).

---

## 10. Content Management (Pregătire)
*   **JSON Schema**: Definirea formatului standard pentru cursuri.
    *   Exemplu: `courses/python-basics.json`.
*   **Asset Management**: Structura folderelor pentru imagini/audio per lecție (`/public/courses/{courseId}/...`).

---

## Estimare și Resurse
*   **Durată estimată (MVP Interfață)**: 2-3 săptămâni (lucru intens).
*   **Resurse necesare**:
    *   Node.js instalat.
    *   Editor cod (VS Code / Trae).
    *   Browser modern.

## Pasul Următor (Imediat)
Începerea punctului **5. Implementare Infrastructură**: Crearea proiectului și configurarea mediului.
