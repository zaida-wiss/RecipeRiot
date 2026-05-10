import { describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

// Supertest kör requests mot Express-appen utan att vi behöver starta app.listen().
describe("Users API", () => {
  it("skapar en användare", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "zaida",
        email: "zaida@example.com",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body.username).toBe("zaida");
    expect(response.body.email).toBe("zaida@example.com");
  });

  it("returnerar 400 när create body saknar obligatoriska fält", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "zaida",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.status).toBe(400);
    expect(response.body.error.message).toBeDefined();
  });

  it("hämtar alla användare", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        username: "zaida",
        email: "zaida@example.com",
        password: "password123",
      });

    const response = await request(app).get("/api/v1/users");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].username).toBe("zaida");
  });

  it("returnerar 404 när användaren inte finns", async () => {
    // Ett giltigt ObjectId-format som inte finns i testdatabasen ska ge 404.
    const missingUserId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/api/v1/users/${missingUserId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Användaren hittades inte.");
  });
});
