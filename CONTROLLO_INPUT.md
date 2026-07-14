# Controllo dei campi compilabili

Il progetto applica due livelli di protezione:

1. **sanitizzazione immediata durante la digitazione o l'incollaggio**, tramite `src/input-sanitizers.ts` e il componente `Field`;
2. **validazione completa al salvataggio**, tramite `src/validation.ts`.

## Regole applicate

| Tipologia | Campi principali | Caratteri ammessi |
|---|---|---|
| Intero | serie, ripetizioni, durate, frequenza, recupero, fatica | solo cifre da `0` a `9` |
| Decimale | carico, target, valore attuale | cifre e un solo separatore decimale; massimo due decimali |
| Data | data sessione, data allenamento, inizio e scadenza obiettivo | solo cifre; trattini inseriti automaticamente |
| Nome/titolo | nomi, titoli, obiettivo, categoria, tipo, nome giorno | lettere accentate, numeri, spazi, apostrofo e trattino |
| Elenco | gruppi muscolari secondari | lettere, numeri, virgole, apostrofi, trattini e barre |
| Testo breve/lungo | attrezzatura, descrizioni e note | testo controllato con limiti di lunghezza e rimozione dei caratteri invisibili |
| Ricerca | tutte le barre di ricerca | testo controllato, massimo 60 caratteri |

## Prove rapide per la discussione orale

- Digitare `+12-3abc` in un campo intero: il campo conserva soltanto `123`.
- Digitare `-12,345abc` nel carico: il campo conserva `12,34`.
- Digitare `2026a02+30` in una data: il campo mostra `2026-02-30`; al salvataggio la data viene respinta perche' inesistente.
- Digitare `Panca@@ piana` nel nome: i simboli non ammessi vengono rimossi.
- Lasciare vuoto un campo obbligatorio: il salvataggio viene bloccato.
- Inserire fatica `11`, serie `101`, durata `1441` o carico `1000,999`: il salvataggio viene bloccato con un messaggio specifico.

## Copertura

Nel codice sono presenti soltanto due punti in cui viene istanziato direttamente un `TextInput`:

- il componente generale `Field`, che sanitizza tutti i campi delle modali;
- la barra di ricerca, che applica `sanitizeInput(..., "search")`.

Tutti i campi `Field` dichiarano esplicitamente `inputKind`; non esistono campi compilabili privi di controllo.
