# Knowledge Lesson Instructions

Ovaj fajl definiše standard za pravljenje novih lekcija u `knowledge/` tako da budu konzistentne sa:

- [lesson1_iskazi_i_iskazne_formule.html](/Users/jovan/personal/prijemni/knowledge/lesson1_codex/lesson1_iskazi_i_iskazne_formule.html)
- referentnim dizajnom iz `reference_designs/knowledge_lesson/`

Koristi ovaj dokument kao **glavno uputstvo** kada praviš sledeće lekcije.

## Glavni cilj

Svaka lekcija treba da bude:

- jedan **samostalan HTML fajl**
- na **srpskom jeziku, latinica**
- pedagoški detaljna
- vizuelno premium i konzistentna
- korisna kao baza znanja, a ne samo kao kratka beleška
- povezana sa prijemnim zadacima i kasnijom primenom

## Obavezna tehnička pravila

Svaka lekcija mora da ispunjava sledeće:

- izlaz je tačno **jedan `.html` fajl**
- sav CSS je unutar `<style>`
- sav JavaScript je unutar `<script>`
- JavaScript mora biti u IIFE obrascu:
  - `(() => { ... })();`
- vidljiva matematika mora koristiti **LaTeX + MathJax**
- nemoj prikazivati matematičke formule kao ASCII tekst ako mogu da se prikažu kroz MathJax
- jedini izuzetak su natpisi unutar `<canvas>` elemenata, jer MathJax ne renderuje unutar canvasa
- dozvoljeni su CDN linkovi za:
  - MathJax
  - Google Fonts
- bez inline event handlera:
  - ne koristiti `onclick`, `onchange`, i slično
- jezik vidljivog sadržaja mora biti:
  - **srpski, latinica**

## Obavezni elementi svake lekcije

Svaka lekcija mora da sadrži sledeće celine.

### 1. Hero sekcija

Mora da sadrži:

- oznaku lekcije, na primer:
  - `Matoteka znanje · Lekcija 2`
- veliki naslov
- kratak uvodni opis teme
- tri kratke kartice ispod naslova, na primer:
  - šta će učenik naučiti
  - najveća zamka
  - prijemni fokus

### 2. Hero slika

Za sada možeš koristiti istu privremenu sliku kao u prvoj lekciji ili drugu privremenu sliku, ali obavezno:

- dodaj HTML komentar sa promptom za buduću generaciju prave slike
- isti prompt dodaj i u metadata blok

Prompt mora biti specifičan za konkretnu lekciju.

### 3. Informacioni blok ispod hero sekcije

Treba da postoji niz kratkih informacija, kao u prvoj lekciji:

- trajanje
- predznanje
- glavna veština
- interaktivni deo

### 4. Meni / brza navigacija

Lekcija mora imati meni sa internim linkovima ka sekcijama, na primer:

- definicije
- operacije
- interaktivni deo
- primeri
- zakoni
- zamke
- prijemni
- vežba

To je obavezan element.

### 5. Sekcija „Zašto je ova lekcija važna“

Mora jasno da objasni:

- zašto je tema bitna
- gde se javlja kasnije
- kakvu korist daje na prijemnim zadacima

Ovo nije ukrasna sekcija. Mora imati stvarnu pedagošku vrednost.

### 6. Glavni nastavni deo

Ovde ide lekcija sama. Mora biti razbijena u jasno odvojene sekcije i kartice.

Obavezno uključi:

- definicije
- objašnjenje pojmova
- intuitivno tumačenje
- formalni zapis
- više primera

Ako tema ima operacije, obrasce, teoreme ili pravila, svaka takva stavka treba da ima:

- naziv
- formulu preko MathJax-a
- kratko objašnjenje
- mini primer ili posledicu

### 7. Interaktivni deo

Svaka lekcija treba da ima **bar jedan smislen interaktivni element**, po mogućstvu preko `<canvas>`.

Interaktivni deo mora:

- da služi učenju
- da ne bude dekoracija
- da radi i na desktopu i na telefonu
- da ima objašnjenje ispod ili pored interakcije

Primeri dobrih interaktivnih delova:

- istinitosna tabela
- brojna prava
- graf funkcije
- geometrijska konstrukcija
- promena parametra kroz slider ili klik

### 8. Vodjeni primeri

Mora postojati deo sa detaljnim primerima.

Za svaki primer:

- naslov primera
- prirodno objašnjenje
- koraci
- formule u MathJax formatu
- kratko tumačenje rezultata

Poželjno:

- klikabilni ili vizuelno izdvojeni koraci

### 9. Mikro-provere tokom lekcije

Tokom lekcije treba ubaciti kraće provere u `details` blokovima, na primer:

- kratko pitanje
- kratak odgovor ili objašnjenje

Ovo je obavezno kada tema to prirodno podržava.

### 10. Zakoni / obrasci / ključne formule

Ako tema ima standardne obrasce, zakone ili ekvivalencije, napravi posebnu sekciju za njih.

Treba da sadrži:

- vizuelno odvojene kartice
- formulu preko MathJax-a
- kratko značenje

### 11. Česte greške

Obavezna sekcija.

Mora da izdvoji tipične greške učenika, ne generičke savete.

Primeri:

- pogrešna negacija
- mešanje nužnog i dovoljnog uslova
- loše postavljen domen
- pogrešan znak

### 12. Veza sa prijemnim zadacima

Obavezna sekcija.

Mora objasniti:

- kako se tema pojavljuje na prijemnim zadacima
- koje tipične zamke pravi
- šta učenik mora da proveri u realnom zadatku

### 13. Vežbe na kraju

Na kraju mora postojati sekcija sa kratkim zadacima.

Svaka vežba treba da ima:

- naslov ili oznaku
- kratko pitanje
- `details` blok sa rešenjem

Vežbe su obavezne.

### 14. Završni uvid / ključna poruka

Poželjna je posebna kartica koja izdvaja glavni uvid lekcije.

Može sadržati:

- ključnu formulu
- glavni princip
- najvažniju misaonu poruku lekcije

### 15. Završni rezime

Obavezna poslednja sekcija.

Mora da bude na samom kraju sadržaja i da sažme:

- šta učenik mora da zapamti
- koje su glavne ideje
- šta je sledeći logičan korak u učenju

## Obavezna MathJax pravila

Sve matematičke jednačine i matematički specifičan tekst treba prikazivati kroz LaTeX, na isti način kao u solution HTML fajlovima.

Koristi:

- inline:
  - `\( ... \)`
- display:
  - `\[ ... \]`

Primeri:

- `\( p \Rightarrow q \)`
- `\( x^2 - 5x + 6 = 0 \)`
- `\[ \neg (p \lor q) \Leftrightarrow (\neg p) \land (\neg q) \]`

Ne koristiti ovakve vidljive prikaze kada može MathJax:

- `p => q`
- `sqrt(x)`
- `x^2`

Osim u `<canvas>` natpisima.

## Vizuelni smer

Zadrži isti opšti vizuelni jezik kao u prvoj lekciji:

- tamna, topla pozadina
- narandžasti akcenti
- staklaste kartice
- premium osećaj
- velika hero tipografija
- jasan ritam sekcija

Nemoj menjati vizuelni sistem iz lekcije u lekciju bez razloga.

## Obavezni metadata blok

Svaki lesson HTML mora da se završi metadata blokom odmah posle `</html>`.

Oblik:

```html
<!--KNOWLEDGE_LESSON_META
{
  "content_type": "knowledge_lesson",
  "lesson_number": 2,
  "title": "Naziv lekcije",
  "subject": "math",
  "unit": "naziv oblasti",
  "language": "sr-Latn",
  "source": "matematika-lekcije.md",
  "source_path_hint": "Kategorija ... > Grupa ...",
  "topic_tags": ["tag1", "tag2", "tag3"],
  "hero_image": {
    "current_src": "trenutni URL ili putanja privremene slike",
    "generation_prompt": "buduci prompt za generaciju prave slike"
  }
}
KNOWLEDGE_LESSON_META-->
```

Ovaj blok je obavezan.

## Preporučena struktura fajla

Redosled sadržaja treba da bude ovakav:

1. `<!DOCTYPE html>`
2. `<html lang="sr">`
3. `<head>`
4. `<title>`
5. `<meta charset>` i viewport
6. skriveni scratchpad blok
7. MathJax setup
8. fontovi
9. `<style>`
10. `<body>`
11. hero
12. info kartice
13. meni
14. zašto je lekcija važna
15. glavni nastavni deo
16. interaktivni deo
17. vodjeni primeri
18. zakoni / obrasci
19. česte greške
20. veza sa prijemnim
21. vežbe
22. završni uvid
23. završni rezime
24. `<script>`
25. `</body>`
26. `</html>`
27. `KNOWLEDGE_LESSON_META`

## Obavezni scratchpad blok

U `<head>` dodaj skriveni blok sa internim planom lekcije, na primer:

```html
<script type="text/info" id="lesson-scratchpad">
...
</script>
```

Tu upiši:

- izvor teme
- cilj lekcije
- ključne tačke
- pedagoške napomene
- opis interaktivnog dela

## Kako koristiti ovaj fajl za sledeće lekcije

Koristi sledeći postupak.

### Opcija A: direktno kao prompt za generaciju

1. Otvori `knowledge-lesson-instructions.md`.
2. Uz njega otvori:
   - `matematika-lekcije.md`
   - poslednju dobru lekciju, na primer `knowledge/lesson1_codex/lesson1_iskazi_i_iskazne_formule.html`
3. U novom zahtevu modelu daj:
   - sadržaj ovog fajla
   - broj lekcije
   - tačan naslov lekcije
   - deo iz `matematika-lekcije.md` koji toj lekciji pripada
   - izlaznu putanju
4. Traži da model vrati:
   - samo jedan samostalan HTML fajl
   - na srpskoj latinici
   - sa MathJax formulama
   - sa `KNOWLEDGE_LESSON_META` blokom

Primer zahteva:

```text
Koristi knowledge-lesson-instructions.md kao glavno uputstvo.
Napravi lekciju 2 pod naslovom "Tautologije i logičke ekvivalencije".
Izvor je matematika-lekcije.md, grupa Matematička logika.
Izlaz treba da bude jedan standalone HTML fajl u srpskoj latinici:
knowledge/lesson2_codex/lesson2_tautologije_i_logicke_ekvivalencije.html
```

### Opcija B: ručno pisanje nove lekcije

Ako lekciju pišeš ručno ili uz više iteracija:

1. Kopiraj strukturu iz prve lekcije.
2. Prođi kroz ovaj fajl kao checklistu.
3. Proveri da su prisutni svi obavezni elementi.
4. Proveri da je sva vidljiva matematika u MathJax formatu.
5. Dodaj `KNOWLEDGE_LESSON_META`.

## Minimalna checklist za gotovu lekciju

Pre nego što prihvatiš novu lekciju, proveri:

- da li je fajl jedan standalone HTML
- da li je sve na srpskoj latinici
- da li postoji meni
- da li postoji sekcija „Zašto je ova lekcija važna“
- da li postoji glavni nastavni deo sa primerima
- da li postoji interaktivni deo
- da li postoje vežbe na kraju
- da li postoji završni rezime
- da li postoji `KNOWLEDGE_LESSON_META`
- da li su formule prikazane kroz LaTeX i MathJax

Ako bilo koja stavka nedostaje, lekcija nije završena.

