# CertiPro - Manual de Utilizare (Admin)

## Introducere
CertiPro este o platformă de învățare interactivă. Panoul de administrare permite gestionarea utilizatorilor, cursurilor și conținutului educațional.

## Funcționalități Principale

### 1. Dashboard
- Vizualizare statistici în timp real: număr utilizatori, cursuri active, venituri.
- Grafic de activitate recentă.

### 2. Gestionare Cursuri (LMS)
- **Adăugare Curs**: Navighează la "Cursuri" -> "Adaugă Curs".
- **Categorii**: Alege categoria (Python, SQL, Networking, etc.) pentru a conecta cursul la mediul de execuție corect.
- **Editor Structură**:
  - Adaugă **Capitole** și **Lecții**.
  - Poți reordona lecțiile.
- **Tipuri de Lecții**:
  - **Text/Video**: Editor clasic WYSIWYG.
  - **Componentă Interactivă (React)**: Introdu numele componentei (ex: `PythonTerminal`) pentru a randa un tool interactiv.
  - **Prezentare (Slide Deck)**: Încarcă un fișier `.json` sau `.mdx` care definește slide-urile.

### 3. Gestionare Utilizatori
- Listă utilizatori cu căutare și filtrare.
- **Acțiuni**:
  - Schimbare rol (User/Admin/Instructor).
  - Banare/Debanare utilizator.
  - Ștergere cont.

### 4. Upload Fișiere
- Sistemul suportă upload de imagini, video și fișiere de cod (pentru prezentări).

## Ghid Tehnic pentru Admini
- **Validare Date**: Toate datele introduse sunt validate automat. Erorile vor fi afișate în interfață.
- **Securitate**: Accesul este protejat prin token-uri. Doar utilizatorii cu rol `admin` au acces.

## Suport
Pentru probleme tehnice, contactați echipa de dezvoltare.
