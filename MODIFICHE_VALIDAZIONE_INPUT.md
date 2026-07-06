# Modifiche introdotte per la validazione degli input

- Aggiunto `src/input-sanitizers.ts` con regole centralizzate per nomi, elenchi, testi, interi, decimali, date e ricerca.
- Aggiornato `Field` per filtrare il testo in `onChangeText`, impostare tastiera e `inputMode` coerenti e applicare limiti di lunghezza.
- Assegnata una tipologia esplicita a ogni campo compilabile.
- Protetta anche la barra di ricerca.
- Reso il parsing numerico rigoroso: un campo obbligatorio vuoto non viene trasformato automaticamente in zero.
- Conservato il valore decimale del carico durante la digitazione, così da poter inserire correttamente valori come `12,5`.
- Rafforzata la validazione al salvataggio con intervalli massimi, controllo dei decimali, date reali e limiti testuali.
- Aggiornata la relazione tecnica per descrivere il comportamento realmente implementato.
