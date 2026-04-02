# Reflektionsdokument – Boiler Room projekt

## Vad blev bra?
Projektet blev lyckat tack vare tydlig komponentstruktur, användning av Reacts Context API och custom hooks för att separera logik och UI. Vi använde funktionsbaserade mappar och CSS Modules för att undvika designkonflikter. Teamet samarbetade via Slack, GitHub Projects och kalkylark, vilket gav bra översikt och snabb kommunikation. User stories och backloggen var tydliga och gav oss en bra grund att bygga vidare på. Vi testade centrala komponenter med Jest och React Testing Library, vilket ökade kvaliteten.

## Vad skulle kunna förbättras?
Vi hade ibland brist på tydliga roller och ansvar, vilket ledde till viss förvirring i början. Planeringen låg efter och vi fick använda AI-stöd för att komma ikapp. Nästa gång skulle vi lägga mer tid på att strukturera backloggen och fördela ansvar tydligare. Vi skulle också implementera protected routes och API-anrop för att få en mer komplett och säker applikation.

## Varför gjorde vi våra val?
Vi valde React för att det är flexibelt och har ett stort ekosystem. Context API valdes för att undvika prop drilling och göra global state tillgänglig. Custom hooks skapades för att återanvända logik och göra komponenterna renare. CSS Modules användes för att isolera styling. TypeScript infördes för att få typsäkerhet och bättre kodkvalitet. Vi valde att inte använda nested routes eller URL-parametrar för att hålla routing enkel.

## Vilka tekniker använde vi?
- React (funktionella komponenter)
- Context API för global state
- Custom hooks (useTimer, useLocalStorage)
- CSS Modules
- TypeScript
- React Router
- Jest & React Testing Library
- GitHub Projects, Slack, Kalkylark

## Slutreflektion

### Vad fungerade bra?
- Tydlig komponentstruktur och separation av logik/UI
- Bra samarbete och kommunikation
- User stories och backlog gav tydlig riktning
- Testning av centrala komponenter

### Vad skulle vi göra annorlunda?
- Mer tid på planering och ansvarsfördelning
- Implementera API och protected routes
- Fler tester och bättre teststruktur

### Vilka tekniska kunskaper utvecklade vi mest?
- React hooks och Context
- TypeScript-konfiguration
- Testning med Jest och React Testing Library

### Hur fungerade teamarbetet?
Teamet samarbetade bra, men vi hade kunnat fördela ansvar tydligare. Alla fick prova olika roller och utvecklade både tekniska och samarbetsmässiga färdigheter.
