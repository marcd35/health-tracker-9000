import { FoodSearch } from '@/components/food/FoodSearch';
import { FoodSearchModal } from '@/components/food/FoodSearchModal';

export default function FoodSearchTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">USDA Food Search Component Test</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 border p-6 rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Inline Search</h2>
          <p className="text-muted-foreground">
            This demonstrates the search component embedded directly in a page.
          </p>
          <FoodSearch />
        </div>

        <div className="space-y-4 border p-6 rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Modal Launcher</h2>
          <p className="text-muted-foreground">
            This demonstrates the search component inside a dialog.
          </p>
          <div className="flex items-center justify-center h-[200px] bg-muted/20 rounded border border-dashed">
            <FoodSearchModal />
          </div>
        </div>
      </div>
    </div>
  );
}
