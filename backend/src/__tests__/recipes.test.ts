import { describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

describe("Recipes API", () => {
  it("skapar ett recept", async () => {
    const response = await request(app)
      .post("/api/v1/recipes")
      .send({
        title: "Pasta",
        createdBy: "Agnes",
        ingredients: ["pasta", "tomat"],
        steps: ["Koka pasta", "Blanda med sås"],
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Pasta");
    expect(response.body.ingredients).toEqual(["pasta", "tomat"]);
  });

  it("returnerar 400 när create body saknar obligatoriska fält", async () => {
    const response = await request(app)
      .post("/api/v1/recipes")
      .send({
        title: "Pasta",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.status).toBe(400);
    expect(response.body.error.message).toBeDefined();
  });

  it("hämtar alla recept", async () => {
    await request(app)
      .post("/api/v1/recipes")
      .send({
        title: "Pasta",
        createdBy: "Agnes",
        ingredients: ["pasta", "tomat"],
        steps: ["Koka pasta", "Blanda med sås"],
      });

    const response = await request(app).get("/api/v1/recipes");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Pasta");
  });

  it("returnerar 404 när receptet inte finns", async () => {
    const missingRecipeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/api/v1/recipes/${missingRecipeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Receptet hittades inte.");
  });
});
