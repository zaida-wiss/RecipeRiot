import { useRef, useState } from 'react';
import { getAuthHeaders } from '../../api/authApi';

type Ingredient = { name: string; quantity: number; unit: string };

type ParsedRecipe = {
  title: string;
  difficulty: string;
  time: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  imageUrl?: string;
};

type UploadResult = { succeeded: number; failed: { title: string; reason: string }[] };

type Props = { onSuccess: () => void };

const UNITS = 'g|dl|ml|l|msk|tsk|st|kg|cl|krm|nypa|bit|bitar';
const WITH_UNIT = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${UNITS})\\s+(.+)$`, 'i');
const WITHOUT_UNIT = /^(\d+(?:[.,]\d+)?)\s+(.+)$/;

const parseIngredient = (raw: string): Ingredient => {
  const trimmed = raw.trim();
  let match = trimmed.match(WITH_UNIT);
  if (match) {
    return { quantity: parseFloat(match[1].replace(',', '.')), unit: match[2].toLowerCase(), name: match[3].trim() };
  }
  match = trimmed.match(WITHOUT_UNIT);
  if (match) {
    return { quantity: parseFloat(match[1].replace(',', '.')), unit: '', name: match[2].trim() };
  }
  return { quantity: 0, unit: '', name: trimmed };
};

const parseLine = (line: string, delimiter: string): string[] => {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === delimiter && !inQuotes) { cols.push(current); current = ''; }
    else { current += char; }
  }
  cols.push(current);
  return cols;
};

const detectDelimiter = (header: string): string => {
  const semicolons = (header.match(/;/g) ?? []).length;
  const commas = (header.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
};

const SUBSEP = '|';

// Support both "|" (new) and ";" (old) as sub-separators within a field.
const splitSubField = (raw: string): string[] => {
  if (raw.includes(SUBSEP)) return raw.split(SUBSEP);
  return raw.split(';');
};

const parseCSV = (text: string): ParsedRecipe[] => {
  // Strip BOM added by Excel on UTF-8 exports.
  const cleaned = text.startsWith('﻿') ? text.slice(1) : text;
  const lines = cleaned.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);

  // Auto-detect header: skip first row only if it looks like a header.
  const firstCols = parseLine(lines[0].trim(), delimiter);
  const hasHeader = firstCols[0].trim().toLowerCase() === 'title' || firstCols[0].trim().toLowerCase() === 'titel';
  const startIndex = hasHeader ? 1 : 0;

  const results: ParsedRecipe[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [title, difficulty, time, tagsRaw, ingredientsRaw, stepsRaw, imageUrl] = parseLine(line, delimiter);
    if (!title?.trim()) continue;
    results.push({
      title: title.trim(),
      difficulty: difficulty?.trim() || 'Medel',
      time: time?.trim() || '',
      tags: tagsRaw ? splitSubField(tagsRaw).map(t => t.trim()).filter(Boolean) : [],
      ingredients: ingredientsRaw ? splitSubField(ingredientsRaw).map(parseIngredient).filter(i => i.name) : [],
      steps: stepsRaw ? splitSubField(stepsRaw).map(s => s.trim()).filter(Boolean) : [],
      ...(imageUrl?.trim() ? { imageUrl: imageUrl.trim() } : {}),
    });
  }
  return results;
};

const TEMPLATE_CSV = [
  'title,difficulty,time,tags,ingredients,steps,imageUrl',
  'Pasta carbonara,Medel,30 min,pasta|snabb,200g pasta | 2 ägg | 50g parmesan,Koka pasta | Blanda ägg och ost | Blanda med pasta,',
  'Tomatsoppa,Lätt,20 min,soppa|vegetarisk,400g krossade tomater | 1 gul lök | 2 msk olivolja,Hacka löken | Fräs löken | Tillsätt tomater och koka 15 min,',
].join('\n');

const downloadTemplate = () => {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recept-mall.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const BulkUpload = ({ onSuccess }: Props) => {
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError('');
    setParsedRecipes([]);
    setProgress(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const recipes = parseCSV(text);
      if (recipes.length === 0) {
        setParseError('Inga recept hittades. Kontrollera att filen följer mallen.');
        return;
      }
      setParsedRecipes(recipes);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleUpload = async () => {
    setLoading(true);
    setProgress({ done: 0, total: parsedRecipes.length });
    let succeeded = 0;
    const failed: { title: string; reason: string }[] = [];

    for (let i = 0; i < parsedRecipes.length; i++) {
      const recipe = parsedRecipes[i];
      try {
        const res = await fetch('/api/v1/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            title: recipe.title,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            difficulty: recipe.difficulty,
            tags: recipe.tags,
            ...(recipe.time ? { time: recipe.time } : {}),
            ...(recipe.imageUrl ? { imageUrl: recipe.imageUrl } : {}),
          }),
        });
        if (res.ok) {
          succeeded++;
        } else {
          const data = await res.json().catch(() => ({}));
          failed.push({ title: recipe.title, reason: (data as { message?: string }).message || 'Okänt fel' });
        }
      } catch {
        failed.push({ title: recipe.title, reason: 'Nätverksfel' });
      }
      setProgress({ done: i + 1, total: parsedRecipes.length });
    }

    setLoading(false);
    setResult({ succeeded, failed });
    // Trigger parent refresh (re-fetch recipes) without closing the modal
    // so the user can read the result. The modal closes when they click "Stäng".
    if (succeeded > 0) onSuccess();
  };

  const resetUpload = () => {
    setResult(null);
    setParsedRecipes([]);
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (result) {
    return (
      <div className="bulk-result">
        <p className="bulk-result-summary">
          <strong>{result.succeeded}</strong> av <strong>{parsedRecipes.length}</strong> recept laddades upp.
        </p>
        {result.failed.length > 0 && (
          <>
            <p className="bulk-result-failed-label">{result.failed.length} misslyckades:</p>
            <ul className="bulk-result-failed-list">
              {result.failed.map((f, i) => (
                <li key={i}><strong>{f.title}</strong> — {f.reason}</li>
              ))}
            </ul>
          </>
        )}
        <button type="button" className="add-btn" onClick={resetUpload}>
          Ladda upp fler
        </button>
      </div>
    );
  }

  return (
    <div className="bulk-upload">
      <p className="bulk-description">
        Ladda upp en CSV-fil med flera recept. Separera taggar, ingredienser och steg med <code>|</code>. Funkar med både komma- och semikolonformat (Excel/Google Kalkyl).
      </p>

      <button type="button" className="template-btn" onClick={downloadTemplate}>
        Ladda ner mall (CSV)
      </button>

      <div className="bulk-file-area" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="bulk-file-input"
          onChange={handleFileChange}
        />
        <span>Klicka för att välja CSV-fil</span>
      </div>

      {parseError && <div className="add-recipe-error">{parseError}</div>}

      {parsedRecipes.length > 0 && (
        <>
          <p className="bulk-found">{parsedRecipes.length} recept hittades:</p>
          <ul className="bulk-preview">
            {parsedRecipes.map((r, i) => (
              <li key={i} className="bulk-preview-item">
                <span className="bulk-preview-title">{r.title}</span>
                <span className="bulk-preview-meta">{r.ingredients.length} ingredienser · {r.steps.length} steg</span>
              </li>
            ))}
          </ul>

          {progress && (
            <div className="bulk-progress">
              <div className="bulk-progress-bar" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              <span className="bulk-progress-label">{progress.done} / {progress.total}</span>
            </div>
          )}

          <button type="button" className="submit-btn" disabled={loading} onClick={handleUpload}>
            {loading
              ? `Laddar upp... (${progress?.done ?? 0}/${progress?.total ?? 0})`
              : `Ladda upp ${parsedRecipes.length} recept`}
          </button>
        </>
      )}
    </div>
  );
};

export default BulkUpload;
