# Tekst-TV arkiv

Dette er en samling av sider fra tekst-TV hos, fortrinnsvis, de norske TV-kanalene NRK1, NRK2, NRK3 og TV2. Innholdet er hentet hovedsaklig fra VHS- og Betamax-kassetter.

Samlingen er hentet ut ved å først foreta et RF-opptak av FM-signalet på videokassetten. Deretter dekodes dette ved hjelp av programvare fra [vhs-decode](https://github.com/oyvindln/vhs-decode)-prosjektet, slik at man ender opp med en TBC-fil som inneholder Y-signalet til videoen. En separat fil for C-signalet lages også i samme prosess, men denne er ikke relevant

Denne TBC-filen for Y-signalet mates så inn i en programvare utviklet av [ali1234](https://github.com/ali1234), kalt [vhs-teletext](https://github.com/ali1234/vhs-teletext). Denne programvaren leser VBI-området og henter ut den digitale informasjonen som inneholder tekst-TV-sidene. 

