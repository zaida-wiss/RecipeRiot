mermaid
sequenceDiagram
  participant C as Klient
  participant API as API (Express)
  participant DB as MongoDB

  C->>API: POST /api/v1/auth/login
  API->>DB: User.findOne({ email eller username })

  alt Användare finns
    DB-->>API: User-dokument med passwordHash
    API->>API: bcrypt.compare(password, passwordHash)

    alt Korrekt lösenord
      API->>API: jwt.sign({ userId, role })
      API-->>C: 200 OK { token, user }
    else Fel lösenord
      API-->>C: 401 Unauthorized
    end
  else Användare finns inte
    DB-->>API: null
    API-->>C: 401 Unauthorized
  end