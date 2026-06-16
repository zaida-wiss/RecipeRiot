import { ChevronDown } from 'lucide-react';
import type { useRecipeFilter } from '../../hooks/useRecipeFilter';
import './RecipeFilterBar.css';

type RecipeFilterBarProps = ReturnType<typeof useRecipeFilter>;

const RecipeFilterBar = ({
  activeTags,
  setActiveTags,
  activeDifficulties,
  setActiveDifficulties,
  activeTimes,
  setActiveTimes,
  openFilter,
  setOpenFilter,
  filterSectionRef,
  allTags,
  difficulties,
  timeOptions,
  filteredRecipes,
  hasActiveFilters,
  clearFilters,
  toggleFilter,
  toggleArrayValue,
}: RecipeFilterBarProps) => (
  <section
    ref={filterSectionRef}
    className="filter-section"
    aria-label="Filtrera recept"
  >
    <div className="filter-grid">
      <div className="filter-group">
        <button
          type="button"
          className={`filter-trigger ${activeTags.length > 0 ? 'filter-trigger--active' : ''}`}
          aria-expanded={openFilter === 'type'}
          onClick={() => toggleFilter('type')}
        >
          <span>Typ av rätt</span>
          <ChevronDown size={17} className={openFilter === 'type' ? 'chevron-open' : ''} />
        </button>
        {openFilter === 'type' && (
          <div className="filter-menu">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={
                  tag === 'Alla'
                    ? activeTags.length === 0 ? 'selected' : ''
                    : activeTags.includes(tag) ? 'selected' : ''
                }
                onClick={() => {
                  setActiveTags((currentTags) =>
                    tag === 'Alla' ? [] : toggleArrayValue(currentTags, tag)
                  );
                }}
              >
                {tag === 'Alla' ? 'Alla typer' : tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <button
          type="button"
          className={`filter-trigger ${activeDifficulties.length > 0 ? 'filter-trigger--active' : ''}`}
          aria-expanded={openFilter === 'difficulty'}
          onClick={() => toggleFilter('difficulty')}
        >
          <span>Svårighetsgrad</span>
          <ChevronDown
            size={17}
            className={openFilter === 'difficulty' ? 'chevron-open' : ''}
          />
        </button>
        {openFilter === 'difficulty' && (
          <div className="filter-menu">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className={
                  difficulty === 'Alla'
                    ? activeDifficulties.length === 0 ? 'selected' : ''
                    : activeDifficulties.includes(difficulty) ? 'selected' : ''
                }
                onClick={() => {
                  setActiveDifficulties((currentDifficulties) =>
                    difficulty === 'Alla'
                      ? []
                      : toggleArrayValue(currentDifficulties, difficulty)
                  );
                }}
              >
                {difficulty === 'Alla' ? 'Alla nivåer' : difficulty}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <button
          type="button"
          className={`filter-trigger ${activeTimes.length > 0 ? 'filter-trigger--active' : ''}`}
          aria-expanded={openFilter === 'time'}
          onClick={() => toggleFilter('time')}
        >
          <span>Tid</span>
          <ChevronDown size={17} className={openFilter === 'time' ? 'chevron-open' : ''} />
        </button>
        {openFilter === 'time' && (
          <div className="filter-menu">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === 'Alla'
                    ? activeTimes.length === 0 ? 'selected' : ''
                    : activeTimes.includes(option.value) ? 'selected' : ''
                }
                onClick={() => {
                  setActiveTimes((currentTimes) =>
                    option.value === 'Alla'
                      ? []
                      : toggleArrayValue(currentTimes, option.value)
                  );
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    {hasActiveFilters && (
      <div className="active-filters" aria-label="Aktiva filter">
        {activeTags.map((tag) => (
          <button
            key={`tag-${tag}`}
            type="button"
            className="active-filter-chip"
            onClick={() => setActiveTags((currentTags) => toggleArrayValue(currentTags, tag))}
            aria-label={`Ta bort filtret ${tag}`}
          >
            {tag}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {activeDifficulties.map((difficulty) => (
          <button
            key={`difficulty-${difficulty}`}
            type="button"
            className="active-filter-chip"
            onClick={() => setActiveDifficulties((currentDifficulties) =>
              toggleArrayValue(currentDifficulties, difficulty)
            )}
            aria-label={`Ta bort filtret ${difficulty}`}
          >
            {difficulty}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {activeTimes.map((time) => {
          const label = timeOptions.find((option) => option.value === time)?.label ?? time;

          return (
            <button
              key={`time-${time}`}
              type="button"
              className="active-filter-chip"
              onClick={() => setActiveTimes((currentTimes) =>
                toggleArrayValue(currentTimes, time)
              )}
              aria-label={`Ta bort filtret ${label}`}
            >
              {label}
              <span aria-hidden="true">×</span>
            </button>
          );
        })}
      </div>
    )}

    <div className="filter-footer">
      <p className="filter-result-count" aria-live="polite">
        {filteredRecipes.length} recept hittades
      </p>
      {hasActiveFilters && (
        <button className="clear-filters-btn" type="button" onClick={clearFilters}>
          Rensa filter
        </button>
      )}
    </div>
  </section>
);

export default RecipeFilterBar;
