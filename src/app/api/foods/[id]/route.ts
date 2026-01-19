import { NextResponse } from 'next/server';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { USDAClient, USDAMapper } from '@/lib/services/usda/index';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const repo = new FoodRepository();

    try {
        // 1. Try to get from local database first
        const localFood = repo.getFoodById(id);

        if (localFood) {
            // If it's a USDA food, and we have the FDC ID, we can fetch fresh raw JSON
            // Note: We don't store raw JSON in the DB currently based on Step 5
            const fdcId = (localFood as any).usda_fdc_id || (localFood as any).usdaFdcId;

            if (fdcId) {
                try {
                    const usdaClient = new USDAClient();
                    const usdaFood = await usdaClient.getFoodById(parseInt(fdcId));
                    return NextResponse.json({
                        ...localFood,
                        rawUSDAData: usdaFood,
                    });
                } catch (error) {
                    console.error('Failed to fetch raw USDA data for local food:', error);
                    // Fallback to local data only
                    return NextResponse.json(localFood);
                }
            }

            return NextResponse.json(localFood);
        }

        // 2. If not in DB, but starts with usda-, try fetching from USDA directly
        if (id.startsWith('usda-')) {
            const fdcId = parseInt(id.replace('usda-', ''));
            if (!isNaN(fdcId)) {
                const usdaClient = new USDAClient();
                const usdaFood = await usdaClient.getFoodById(fdcId);
                const mappedFood = USDAMapper.toFood(usdaFood);
                return NextResponse.json(mappedFood);
            }
        }

        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    } catch (error) {
        console.error(`Error fetching food details for ID ${id}:`, error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
