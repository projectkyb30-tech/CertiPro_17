# CertiPro - Platformă de Învățare IT

CertiPro este o aplicație modernă de tip **LMS (Learning Management System)** construită pentru a ajuta utilizatorii să învețe concepte IT și să se pregătească pentru certificări. Aplicația este dezvoltată folosind tehnologii web moderne și este optimizată atât pentru desktop, cât și pentru mobil (prin Capacitor).

## 🚀 Tehnologii Utilizate

- **Frontend:** React 19, TypeScript, Vite
- **Stilizare:** Tailwind CSS, Lucide React (pentru iconițe)
- **State Management:** Zustand (cu persistență locală)
- **Routing:** React Router DOM v7
- **Mobile:** Capacitor (Android & iOS)
- **Animații:** Framer Motion

## 📂 Structura Proiectului

Proiectul urmărește o arhitectură bazată pe funcționalități (**Feature-based Architecture**), ceea ce îl face ușor de scalat și întreținut.

```text
src/
├── components/        # Componente UI reutilizabile (Butoane, Input-uri, Layout-uri)
├── features/          # Modulele principale ale aplicației
│   ├── courses/       # Logica și componentele pentru cursuri
│   ├── dashboard/     # Widget-uri și logica pentru dashboard
│   ├── profile/       # Setări și profil utilizator
│   └── tutorial/      # Sistemul de onboarding și tutoriale
├── pages/             # Paginile aplicației (asamblarea componentelor)
├── services/          # Servicii pentru API și logică de business
├── store/             # Managementul stării globale (Zustand slices)
├── types/             # Definițiile de tipuri TypeScript (Interfețe globale)
└── routes/            # Configurația rutelor (publice și protejate)
```

## 🛠️ Instalare și Rulare

1.  **Instalare dependențe:**
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Rulare server de dezvoltare (Web):**
    ```bash
    npm run dev
    ```

3.  **Construire pentru producție (Web):**
    ```bash
    npm run build
    ```

4.  **Rulare pe Android (necesită Android Studio):**
    Asigură-te că ai folderul `android` generat.
    ```bash
    npx cap open android
    ```

## 📱 Funcționalități Cheie

*   **Sistem de Autentificare:** Login, Înregistrare, Verificare OTP.
*   **Cursuri Interactive:** Suport pentru lecții text, quiz-uri și exerciții de cod.
*   **Gamification:** Sistem de XP, Streak-uri și progres vizual.
*   **Mod Noapte (Dark Mode):** Suport nativ pentru temă întunecată.
*   **Tutorial Interactiv:** Ghid pas-cu-pas pentru noii utilizatori (folosind `react-joyride`).
*   **Suport Offline:** Arhitectură pregătită pentru PWA/Mobile.

## 🧪 Testare

Aplicația folosește **Vitest** pentru testarea unitară și **React Testing Library** pentru testarea componentelor.

### Rulare Teste

- **Rulare toate testele:**
  ```bash
  npm run test:run
  ```

- **Rulare teste în mod watch (interactiv):**
  ```bash
  npm test
  ```

- **Rulare teste cu interfață UI:**
  ```bash
  npm run test:ui
  ```

- **Generare raport de acoperire (Coverage):**
  ```bash
  npm run test:coverage
  ```

## 🤝 Contribuție

1.  Asigură-te că respecți structura de directoare existentă.
2.  Folosește tipuri stricte în TypeScript (evită `any`).
3.  Creează componente mici și reutilizabile în `components/ui`.

---
Dezvoltat cu ❤️ pentru educație IT.
