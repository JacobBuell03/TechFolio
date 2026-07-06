export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Filter by category">
      <button
        role="tab"
        aria-selected={active === 'All'}
        className={`cat-tab ${active === 'All' ? 'cat-tab-active' : ''}`}
        onClick={() => onChange('All')}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          role="tab"
          aria-selected={active === cat}
          className={`cat-tab ${active === cat ? 'cat-tab-active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
