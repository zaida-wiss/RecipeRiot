import { useState } from "react";
import styles from "./ShoppingList.module.css";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { recipes } from "../data/mockRecipes";

/* =========================
   TYPES
========================= */

type ShoppingItem = {
  id: number;
  name: string;
  amount?: string;
  checked: boolean;
};

/* =========================
   COMPONENT
========================= */

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const [input, setInput] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [unit, setUnit] = useState("st");

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const parseAmount = (amount?: string) => {
    if (!amount) return null;

    const match = amount.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (!match) return null;

    return {
      value: parseFloat(match[1]),
      unit: match[2] || "",
    };
  };

  const addItem = (name: string, amount?: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      );

      const newParsed = parseAmount(amount);

      if (!existing) {
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name,
            amount,
            checked: false,
          },
        ];
      }

      const existingParsed = parseAmount(existing.amount);

      return prev.map((item) => {
        if (item.name.toLowerCase() !== name.toLowerCase()) return item;

        if (
          existingParsed &&
          newParsed &&
          existingParsed.unit === newParsed.unit
        ) {
          return {
            ...item,
            amount: `${existingParsed.value + newParsed.value} ${existingParsed.unit}`,
          };
        }

        return {
          ...item,
          amount: item.amount && amount ? `${item.amount} + ${amount}` : item.amount || amount,
        };
      });
    });
  };

  const handleAddManual = () => {
    if (!input.trim()) return;

    const name = input.trim();

    const finalAmount = amountValue
      ? `${amountValue} ${unit}`
      : undefined;

    addItem(name, finalAmount);

    setInput("");
    setAmountValue("");
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleIngredientClick = (name: string, amount?: string) => {
    addItem(name, amount);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        <div className={styles.left}>
          <div className={styles.card}>

            <div className={styles.header}>
              <h2>Inköpslista</h2>
            </div>

            {items.length === 0 && (
              <div className={styles.empty}>
                <ShoppingCart size={40} />
                <p><strong>Din inköpslista är tom</strong></p>
              </div>
            )}

            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>

                  <label className={styles.row}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className={item.checked ? styles.checked : ""}>
                      {item.name}
                    </span>
                  </label>

                  <div className={styles.itemRight}>
                    <span className={styles.amount}>
                      {item.amount ?? ""}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.deleteButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </li>
              ))}
            </ul>

            <div className={styles.inputWrapper}>

              <input
                type="text"
                placeholder="Vad vill du köpa?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={styles.input}
              />

              <input
                type="number"
                placeholder="Mängd"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                className={styles.amountInput}
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={styles.unitSelect}
              >
                <option value="st">st</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="dl">dl</option>
                <option value="ml">ml</option>
              </select>

              <button onClick={handleAddManual} className={styles.button}>
                <Plus size={18} />
              </button>

            </div>

          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>

            {!selectedRecipe && (
              <div className={styles.recipeGrid}>
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={styles.recipeCard}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                  >
                    <img src={recipe.image} alt={recipe.title} />
                    <h3>{recipe.title}</h3>
                  </div>
                ))}
              </div>
            )}

            {selectedRecipe && (
              <div className={styles.recipeDetail}>

                <button
                  className={styles.backButton}
                  onClick={() => setSelectedRecipeId(null)}
                >
                  ← Tillbaka
                </button>

                <h2>{selectedRecipe.title}</h2>

                <ul className={styles.ingredients}>
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleIngredientClick(ing.name, ing.amount)
                          }
                        />
                        {ing.name} {ing.amount}
                      </label>
                    </li>
                  ))}
                </ul>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}