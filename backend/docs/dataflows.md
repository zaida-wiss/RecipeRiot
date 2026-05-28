# Dataflöden i RecipeRiot

## Personuppgifter

RecipeRiot sparar bara de användaruppgifter som behövs för konton och behörighet.

| Fält | Varför behövs det? |
| --- | --- |
| username | Visa användarnamn och identifiera användare i appen |
| email | Login och kontoidentifiering |
| passwordHash | Verifiera lösenord utan att lagra lösenord i klartext |
| role | Styra behörighet med RBAC |

Vi sparar inte personnummer, adress, telefonnummer, födelsedatum eller IP-adress eftersom appen inte behöver det.

## Dataflöde: registrering

frontend UserLogin -> POST /api/v1/auth/register -> authController -> User -> MongoDB

Backend sparar aldrig lösenord i klartext. Lösenord hashashas till passwordHash.

## Dataflöde: login

frontend UserLogin -> POST /api/v1/auth/login -> authController -> JWT -> localStorage

JWT sparas i frontendens localStorage i kursprojektet.

## Dataflöde: skapa recept

frontend -> POST /api/v1/recipes -> authenticate -> recipesController -> Recipe -> MongoDB

Frontend skickar inte createdBy. Backend tar user id från verifierad JWT.

## Loggning

Vi loggar request-metod, path, status och tid. Vi loggar inte body, password, passwordHash eller Authorization-header.

## Radering

När en användare raderar sitt konto tar backend bort användaren och anonymiserar användarens recept genom att sätta createdBy till "Raderad användare".