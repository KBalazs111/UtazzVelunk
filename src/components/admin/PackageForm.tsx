import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { TravelPackage } from '../../types';

// form adatok
export type PackageFormData = Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt' | 'departureDate' | 'returnDate' | 'rating' | 'reviewCount'> & {
    departureDate: string;
    returnDate: string;
};

// form state seged
type FormValue = string | number | boolean | string[] | TravelPackage['itinerary'];

interface PackageFormProps {
    initialData?: TravelPackage | null;
    onSubmit: (data: PackageFormData) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const ArrayInput = ({
                        label,
                        items = [],
                        onChange,
                        placeholder
                    }: {
    label: string,
    items: string[],
    onChange: (items: string[]) => void,
    placeholder: string
}) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex gap-2 mb-2">
                <Input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleAdd} size="sm">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                        <span className="truncate">{item}</span>
                        <button type="button" onClick={() => handleRemove(idx)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PackageForm: React.FC<PackageFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const defaultState: PackageFormData = {
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        destination: '',
        country: '',
        continent: 'Európa',
        price: 0,
        originalPrice: 0,
        currency: 'HUF',
        duration: 1,
        maxGroupSize: 10,
        availableSpots: 10,
        category: 'cultural',
        difficulty: 'moderate',
        coverImage: '',
        departureDate: new Date().toISOString().split('T')[0],
        returnDate: new Date().toISOString().split('T')[0],
        images: [],
        included: [],
        notIncluded: [],
        highlights: [],
        itinerary: [],
        isActive: true,
        isFeatured: false,
    };

    const [formData, setFormData] = useState<PackageFormData>(defaultState);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultState,
                ...initialData,
                departureDate: new Date(initialData.departureDate).toISOString().split('T')[0],
                returnDate: new Date(initialData.returnDate).toISOString().split('T')[0],
                images: Array.isArray(initialData.images) ? initialData.images : [],
                included: Array.isArray(initialData.included) ? initialData.included : [],
                notIncluded: Array.isArray(initialData.notIncluded) ? initialData.notIncluded : [],
                highlights: Array.isArray(initialData.highlights) ? initialData.highlights : [],
                itinerary: Array.isArray(initialData.itinerary) ? initialData.itinerary : [],
            });
        } else {
            setFormData(defaultState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);


    const handleChange = (field: keyof PackageFormData, value: FormValue) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Utazás neve" value={formData.title} onChange={e => handleChange('title', e.target.value)} required />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Ország" value={formData.country} onChange={e => handleChange('country', e.target.value)} required />
                    <Input label="Város/Régió" value={formData.destination} onChange={e => handleChange('destination', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Ár (HUF)" type="number" value={formData.price} onChange={e => handleChange('price', Number(e.target.value))} required />
                <Input label="Eredeti Ár (opcionális)" type="number" value={formData.originalPrice || 0} onChange={e => handleChange('originalPrice', Number(e.target.value))} />
                <Select
                    label="Kontinens"
                    value={formData.continent}
                    onChange={val => handleChange('continent', val)}
                    options={[
                        { value: 'Európa', label: 'Európa' },
                        { value: 'Ázsia', label: 'Ázsia' },
                        { value: 'Afrika', label: 'Afrika' },
                        { value: 'Észak-Amerika', label: 'Észak-Amerika' },
                        { value: 'Dél-Amerika', label: 'Dél-Amerika' },
                        { value: 'Óceánia', label: 'Óceánia' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                <Input label="Indulás" type="date" value={formData.departureDate} onChange={e => handleChange('departureDate', e.target.value)} required />
                <Input label="Visszaérkezés" type="date" value={formData.returnDate} onChange={e => handleChange('returnDate', e.target.value)} required />
                <Input label="Időtartam (nap)" type="number" value={formData.duration} onChange={e => handleChange('duration', Number(e.target.value))} required />
                <Input label="Max létszám" type="number" value={formData.maxGroupSize} onChange={e => handleChange('maxGroupSize', Number(e.target.value))} required />
                <Input label="Szabad helyek" type="number" value={formData.availableSpots} onChange={e => handleChange('availableSpots', Number(e.target.value))} required />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rövid leírás (kártyákhoz)</label>
                <textarea
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={2}
                    value={formData.shortDescription}
                    onChange={e => handleChange('shortDescription', e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Részletes leírás</label>
                <textarea
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={5}
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Kategória"
                    value={formData.category}
                    onChange={val => handleChange('category', val)}
                    options={[
                        { value: 'cultural', label: 'Kulturális' },
                        { value: 'adventure', label: 'Kaland' },
                        { value: 'beach', label: 'Tengerpart' },
                        { value: 'city', label: 'Városlátogatás' },
                        { value: 'nature', label: 'Természet' },
                    ]}
                />
                <Select
                    label="Nehézség"
                    value={formData.difficulty}
                    onChange={val => handleChange('difficulty', val)}
                    options={[
                        { value: 'easy', label: 'Könnyű' },
                        { value: 'moderate', label: 'Közepes' },
                        { value: 'hard', label: 'Nehéz' },
                    ]}
                />
            </div>

            <div className="space-y-4 border-t pt-4">
                <Input label="Borítókép URL" value={formData.coverImage} onChange={e => handleChange('coverImage', e.target.value)} placeholder="https://..." required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ArrayInput
                        label="További képek (URL)"
                        items={formData.images}
                        onChange={items => handleChange('images', items)}
                        placeholder="Kép URL hozzáadása..."
                    />
                    <ArrayInput
                        label="Fénypontok (Highlights)"
                        items={formData.highlights}
                        onChange={items => handleChange('highlights', items)}
                        placeholder="Pl. Eiffel torony..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ArrayInput
                        label="Az ár tartalmazza"
                        items={formData.included}
                        onChange={items => handleChange('included', items)}
                        placeholder="Pl. Szállás..."
                    />
                    <ArrayInput
                        label="Az ár NEM tartalmazza"
                        items={formData.notIncluded}
                        onChange={items => handleChange('notIncluded', items)}
                        placeholder="Pl. Biztosítás..."
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Mégsem</Button>
                <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                    {initialData ? 'Módosítások mentése' : 'Csomag létrehozása'}
                </Button>
            </div>
        </form>
    );
};

export default PackageForm;