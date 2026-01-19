import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Grid, List } from 'lucide-react';
import { TravelFilters, TravelCategory, TravelPackage } from '../../types';
import { Button, Input, Select, Card, Badge } from '../../components/ui';
import { PackageCard } from '../../components/features';
import { packageService } from '../../services/packageService';
import { getCategoryLabel, cn } from '../../utils/helpers';

const PackagesPage: React.FC = () => {
    const [filters, setFilters] = useState<TravelFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [packages, setPackages] = useState<TravelPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchPackages = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await packageService.getAll(filters);
            setPackages(data);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPackages();
        }, 500);

        return () => clearTimeout(timer);
    }, [fetchPackages]);

    const categories: TravelCategory[] = [
        'beach', 'adventure', 'cultural', 'city', 'nature', 'cruise', 'safari', 'ski', 'wellness'
    ];

    const continents = ['Európa', 'Ázsia', 'Afrika', 'Észak-Amerika', 'Dél-Amerika', 'Óceánia'];

    const sortOptions = [
        { value: 'price-asc', label: 'Ár: növekvő' },
        { value: 'price-desc', label: 'Ár: csökkenő' },
        { value: 'duration-asc', label: 'Időtartam (rövid elől)' },
        { value: 'duration-desc', label: 'Időtartam (hosszú elől)' },
    ];

    const clearFilters = () => {
        setFilters({});
    };


    const activeFilterCount = Object.keys(filters).filter(key => {
        const filterKey = key as keyof TravelFilters;
        const value = filters[filterKey];

        if (value === undefined || value === '') return false;

        if (filterKey === 'duration' && typeof value === 'object') {
            const duration = value as { min: number; max: number };
            return duration.min > 0 || duration.max > 0;
        }

        return true;
    }).length;

    return (
        <div className="min-h-screen bg-sand-50">

            <section className="relative h-64 md:h-80 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920"
                    alt="Travel"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/40" />
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            Utazási ajánlatok
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl">
                            Fedezze fel gondosan válogatott utazási csomagjainkat a világ minden tájáról
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <Input
                            placeholder="Keresés úti cél, ország vagy kulcsszó alapján..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            leftIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select
                            options={sortOptions}
                            value={filters.sortBy ? `${filters.sortBy}-${filters.sortOrder}` : ''}
                            onChange={(value) => {
                                const [sortBy, sortOrder] = value.split('-') as [TravelFilters['sortBy'], 'asc' | 'desc'];
                                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                            }}
                            placeholder="Rendezés"
                            className="w-48"
                        />
                        <Button
                            variant={showFilters ? 'primary' : 'secondary'}
                            onClick={() => setShowFilters(!showFilters)}
                            leftIcon={<SlidersHorizontal className="w-5 h-5" />}
                        >
                            Szűrők
                            {activeFilterCount > 0 && (
                                <Badge variant="warning" size="sm" className="ml-2">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                        <div className="hidden md:flex border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'p-3 transition-colors',
                                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-400 hover:text-gray-600'
                                )}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'p-3 transition-colors',
                                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-400 hover:text-gray-600'
                                )}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>


                {showFilters && (
                    <Card padding="lg" className="mb-8 animate-slide-down">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Szűrők</h3>
                            {activeFilterCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="w-4 h-4 mr-1" />
                                    Szűrők törlése
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Kategória
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setFilters(prev => ({
                                                ...prev,
                                                category: prev.category === category ? undefined : category
                                            }))}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                                filters.category === category
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            )}
                                        >
                                            {getCategoryLabel(category)}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Kontinens
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {continents.map((continent) => (
                                        <button
                                            key={continent}
                                            onClick={() => setFilters(prev => ({
                                                ...prev,
                                                continent: prev.continent === continent ? undefined : continent
                                            }))}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                                filters.continent === continent
                                                    ? 'bg-secondary-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            )}
                                        >
                                            {continent}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Ár (HUF)
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            minPrice: e.target.value ? parseInt(e.target.value) : undefined
                                        }))}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            maxPrice: e.target.value ? parseInt(e.target.value) : undefined
                                        }))}
                                    />
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Időtartam (nap)
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.duration?.min || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            duration: {
                                                ...prev.duration,
                                                min: e.target.value ? parseInt(e.target.value) : 0,
                                                max: prev.duration?.max || 0
                                            }
                                        }))}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.duration?.max || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            duration: {
                                                ...prev.duration,
                                                min: prev.duration?.min || 0,
                                                max: e.target.value ? parseInt(e.target.value) : 0
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}


                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        {isLoading ? 'Keresés...' : (
                            <><span className="font-semibold text-gray-900">{packages.length}</span> utazás található</>
                        )}
                    </p>
                </div>


                {isLoading ? (
                    // Loading Skeleton
                    <div className={cn(
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                            : 'space-y-6'
                    )}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : packages.length > 0 ? (
                    <div className={cn(
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                            : 'space-y-6'
                    )}>
                        {packages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                package={pkg}
                                variant={viewMode === 'list' ? 'horizontal' : 'default'}
                            />
                        ))}
                    </div>
                ) : (
                    <Card padding="lg" className="text-center py-16">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nincs találat
                        </h3>
                        <p className="text-gray-600 mb-6">
                            A megadott szűrőknek megfelelő utazás nem található. Próbáljon más feltételeket!
                        </p>
                        <Button variant="primary" onClick={clearFilters}>
                            Szűrők törlése
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PackagesPage;