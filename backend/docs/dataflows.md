# Dataflöden i RecipeRiot

## Personuppgifter

| Data | Var finns den? | Varför behövs den? | Vem kan se den? |
| --- | --- | --- | --- |
| username | User | Visa användarnamn och login | användaren, admin |
| email | User | login och kontoidentifiering | användaren, admin |
| passwordHash | User | verifiera lösenord | endast backend |
| role | User/JWT | behörighet | backend, frontend |
| createdBy | Recipe | koppla recept till användare | backend, frontend vid recept |

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

När en användare raderar sitt konto tar backend bort användaren och anonymiserar användarens recept genom att sätta createdBy till deleted-user.