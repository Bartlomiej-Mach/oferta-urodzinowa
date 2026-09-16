# Biblioteki zewnętrzne

Pliki w tym folderze leżą lokalnie, żeby strona działała także bez internetu
i bez zależności od CDN (żadnych blokad, SRI ani CORS).

| Plik | Wersja | Źródło |
| --- | --- | --- |
| `gsap.min.js` | 3.15.0 | https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js |
| `ScrollTrigger.min.js` | 3.15.0 | https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js |

Aktualizacja: podmień numer wersji w powyższych adresach, pobierz oba pliki i nadpisz je
w tym folderze. Potem sprawdź konsolę – `animations.js` wypisuje komunikat `[animacje] ...`
oraz ustawia `data-animations` na `<html>`.