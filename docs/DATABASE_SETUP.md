# Documentație Bază de Date și Setup

**Data ultimei actualizări:** 04 Februarie 2026
**Status:** ✅ FAZA 1 COMPLETĂ (Schema Inițială Aplicată)

## 1. Arhitectura Datelor
Baza de date este găzduită pe **Supabase** (PostgreSQL) și folosește **RLS (Row Level Security)** pentru protecție maximă.

### Tabele Principale
1.  **`profiles`**
    *   **Rol:** Extinde datele de autentificare standard. Stochează XP, Streak, Nume, Avatar.
    *   **Securitate:** Doar utilizatorul își poate modifica propriul profil. Oricine poate citi (pentru leaderboard-uri viitoare).
    *   **Legătură:** 1-la-1 cu tabelul `auth.users` din Supabase.

2.  **`courses`**
    *   **Rol:** Catalogul principal de cursuri (Python, SQL, Networking).
    *   **Securitate:** Public (citire). Doar adminii pot modifica (viitor).

3.  **`modules`**
    *   **Rol:** Capitolele fiecărui curs.
    *   **Legătură:** Mulți-la-1 cu `courses`.

4.  **`lessons`**
    *   **Rol:** Conținutul efectiv (Text, Quiz, Video).
    *   **Securitate:** Public (citire). Conținutul este stocat în format Markdown.

5.  **`user_progress`**
    *   **Rol:** Urmărește ce lecții a completat fiecare utilizator.
    *   **Securitate:** Strict privată. Doar utilizatorul își vede progresul.

## 2. Jurnal de Execuție (Log)

| Data | Fișier | Descriere | Status |
| :--- | :--- | :--- | :--- |
| 04.02.2026 | `supabase_schema.sql` | Crearea tabelelor inițiale + Politici RLS de securitate. | ✅ EXECUTAT |
| 05.02.2026 | `db/01_master_setup.sql` | RESET TOTAL + Structură Producție (Enrollments, Payments, Triggers) | ⏳ PENDING |

## 3. Instrucțiuni pentru Dezvoltatori Viitori

### Cum se aplică modificări noi?
1.  Nu modificați fișierele SQL vechi care au statusul "EXECUTAT".
2.  Creați un fișier nou, ex: `update_v2_add_payments.sql`.
3.  Testați local sau pe un proiect de staging.
4.  Rulați în Supabase -> SQL Editor.
5.  Adăugați intrarea în tabelul de mai sus.

### Cum verific dacă merge?
*   Intră în `Table Editor` în Supabase.
*   Dacă vezi tabelele `profiles`, `courses`, etc., totul este corect.

---
*Acest document trebuie actualizat la fiecare modificare a bazei de date.*
