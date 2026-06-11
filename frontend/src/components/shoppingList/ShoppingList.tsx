import { useState, useEffect } from "react";
import styles from "./ShoppingList.module.css";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import type { Recipe } from "../../types";

type ShoppingItem = {
  id: number;
  name: string;
  amount?: string;
  checked: boolean;
};

export default function ShoppingList() {
  // Läser sparade items från localStorage vid start
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingItems');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [plannedRecipes, setPlannedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [unit, setUnit] = useState("st");

  // Spara items till localStorage när de ändras
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  // Hämta planerade måltider från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plannedMeals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlannedRecipes(Object.values(parsed) as Recipe[]);
      } catch (e) {
        console.error("Kunde inte läsa sparade måltider:", e);
      }
    }
  }, []);

  const selectedRecipe = plannedRecipes.find((r) => r._id === selectedRecipeId);

  const addItem = (name: string, amount?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev.map((item) =>
          item.name.toLowerCase() === name.toLowerCase()
            ? {
                ...item,
                amount: item.amount && amount
                  ? `${item.amount} + ${amount}`
                  : item.amount || amount,
              }
            : item
        );
      }
      return [...prev, { id: Date.now(), name, amount, checked: false }];
    });
  };

  const handleAddManual = () => {
    if (!input.trim()) return;
    const finalAmount = amountValue ? `${amountValue} ${unit}` : undefined;
    addItem(input.trim(), finalAmount);
    setInput("");
    setAmountValue("");
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        {/* VÄNSTER: Inköpslistan */}
        <div className={styles.left}>
          <div className={styles.card}>
            <div className={styles.header}>
              <ShoppingCart size={22} color="#c56a2d" />
              <h2>Inköpslista</h2>
              {items.length > 0 && (
                <button onClick={clearAll} className={styles.clearButton}>
                  Rensa allt
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className={styles.empty}>
                <ShoppingCart size={40} />
                <p><strong>Din inköpslista är tom</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                  Lägg till ingredienser från recepten till höger
                </p>
              </div>
            ) : (
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
                      <span className={styles.amount}>{item.amount ?? ""}</span>
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
            )}

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Vad vill du köpa?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
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

        {/* HÖGER: Recepten */}
        <div className={styles.right}>
          <div className={styles.card}>
            {plannedRecipes.length === 0 ? (
              <div className={styles.empty}>
                <p style={{ fontSize: '0.95rem' }}>
                  Planera din vecka först så visas recepten här!
                </p>
              </div>
            ) : !selectedRecipe ? (
              <div className={styles.recipeGrid}>
                {plannedRecipes.map((r) => (
                  <div
                    key={r._id}
                    className={styles.recipeCard}
                    onClick={() => setSelectedRecipeId(r._id)}
                  >
                    {r.imageUrl && (
                      <img src={r.imageUrl} alt={r.title} />
                    )}
                    <h3>{r.title}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.recipeDetail}>
                <button
                  className={styles.backButton}
                  onClick={() => setSelectedRecipeId(null)}
                >
                  ← Tillbaka
                </button>
                <h2>{selectedRecipe.title}</h2>
                <ul className={styles.ingredients}>
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="checkbox"
                          onChange={() =>
                            addItem(ing.name, `${ing.quantity} ${ing.unit}`)
                          }
                        />
                        {ing.name} {ing.quantity} {ing.unit}
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