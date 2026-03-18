import { categoryInfo } from '../../data/mockPlaces'

interface CategoryFilterProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full transition-all ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-md scale-105'
            : 'bg-card text-foreground border border-border hover:border-primary'
        }`}
      >
        <span className="text-[11px] font-medium">전체</span>
      </button>

      {Object.entries(categoryInfo).map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelectCategory(key)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
            selectedCategory === key
              ? 'shadow-md scale-105'
              : 'bg-card border border-border hover:border-primary'
          }`}
          style={{
            backgroundColor: selectedCategory === key ? info.color : undefined,
            color: selectedCategory === key ? '#FFFFFF' : undefined,
          }}
        >
          <span className="text-sm">{info.icon}</span>
          <span className="text-[11px] font-medium">{info.name}</span>
        </button>
      ))}
    </div>
  )
}
