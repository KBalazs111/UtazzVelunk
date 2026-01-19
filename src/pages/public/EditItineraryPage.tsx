import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Loader2,
    Sun,
    Coffee,
    Moon,
    MapPin,
    Clock,
    Plus,
    Trash2,
    GripVertical,
    Building,
    Utensils,
    AlertCircle,
    Check,
    Sparkles,
    Lightbulb,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { itineraryService } from '../../services/itineraryService';
import { AIItinerary, AIItineraryDay, ActivityBlock, MealRecommendation } from '../../types';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';

// Szerkeszthető tevékenység blokk komponens
interface ActivityEditorProps {
    activity: ActivityBlock;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    onChange: (activity: ActivityBlock) => void;
}

const ActivityEditor: React.FC<ActivityEditorProps> = ({ activity, timeOfDay, onChange }) => {
    const getTimeIcon = () => {
        switch (timeOfDay) {
            case 'morning':
                return <Sun className="w-5 h-5 text-amber-500" />;
            case 'afternoon':
                return <Coffee className="w-5 h-5 text-blue-500" />;
            case 'evening':
                return <Moon className="w-5 h-5 text-purple-500" />;
        }
    };

    const getTimeLabel = () => {
        switch (timeOfDay) {
            case 'morning':
                return 'Délelőtt';
            case 'afternoon':
                return 'Délután';
            case 'evening':
                return 'Este';
        }
    };

    const getBgColor = () => {
        switch (timeOfDay) {
            case 'morning':
                return 'bg-amber-50 border-amber-200';
            case 'afternoon':
                return 'bg-blue-50 border-blue-200';
            case 'evening':
                return 'bg-purple-50 border-purple-200';
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getBgColor()}`}>
            <div className="flex items-center gap-2 mb-3">
                {getTimeIcon()}
                <span className="font-medium text-gray-700">{getTimeLabel()}</span>
            </div>

            <div className="space-y-3">
                <Input
                    label="Tevékenység"
                    value={activity.activity}
                    onChange={(e) => onChange({ ...activity, activity: e.target.value })}
                    placeholder="pl. Múzeum látogatás"
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leírás</label>
                    <textarea
                        value={activity.description}
                        onChange={(e) => onChange({ ...activity, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Részletes leírás..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Időtartam"
                        value={activity.duration}
                        onChange={(e) => onChange({ ...activity, duration: e.target.value })}
                        placeholder="pl. 2-3 óra"
                    />
                    <Input
                        label="Helyszín"
                        value={activity.location || ''}
                        onChange={(e) => onChange({ ...activity, location: e.target.value })}
                        placeholder="pl. Belváros"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Becsült költség"
                        value={activity.cost || ''}
                        onChange={(e) => onChange({ ...activity, cost: e.target.value })}
                        placeholder="pl. 5000 Ft"
                    />
                    <Input
                        label="Tipp"
                        value={activity.tips || ''}
                        onChange={(e) => onChange({ ...activity, tips: e.target.value })}
                        placeholder="Hasznos tanács..."
                    />
                </div>
            </div>
        </div>
    );
};

// Nap szerkesztő komponens
interface DayEditorProps {
    day: AIItineraryDay;
    dayIndex: number;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (day: AIItineraryDay) => void;
    onDelete: () => void;
    totalDays: number;
}

const DayEditor: React.FC<DayEditorProps> = ({
    day,
    dayIndex,
    isExpanded,
    onToggle,
    onChange,
    onDelete,
    totalDays,
}) => {
    const handleMealChange = (index: number, field: keyof MealRecommendation, value: string) => {
        const newMeals = [...day.meals];
        newMeals[index] = { ...newMeals[index], [field]: value };
        onChange({ ...day, meals: newMeals });
    };

    return (
        <Card padding="none" className="overflow-hidden">
            {/* Nap fejléc */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{day.day}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{day.title || `${day.day}. nap`}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{day.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {totalDays > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Nap tartalma  */}
            {isExpanded && (
                <div className="p-6 space-y-6 border-t border-gray-100">
                    {/* Alapadatok */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nap címe"
                            value={day.title}
                            onChange={(e) => onChange({ ...day, title: e.target.value })}
                            placeholder="pl. Városnézés"
                        />
                        <Input
                            label="Dátum (opcionális)"
                            value={day.date || ''}
                            onChange={(e) => onChange({ ...day, date: e.target.value })}
                            placeholder="pl. 2025. június 15."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nap leírása</label>
                        <textarea
                            value={day.description}
                            onChange={(e) => onChange({ ...day, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={2}
                            placeholder="A nap rövid összefoglalója..."
                        />
                    </div>

                    {/* Tevékenységek */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            Napirend
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <ActivityEditor
                                activity={day.morning}
                                timeOfDay="morning"
                                onChange={(morning) => onChange({ ...day, morning })}
                            />
                            <ActivityEditor
                                activity={day.afternoon}
                                timeOfDay="afternoon"
                                onChange={(afternoon) => onChange({ ...day, afternoon })}
                            />
                            <ActivityEditor
                                activity={day.evening}
                                timeOfDay="evening"
                                onChange={(evening) => onChange({ ...day, evening })}
                            />
                        </div>
                    </div>

                    {/* Szállás */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Building className="w-5 h-5 text-primary-500" />
                            Szállás
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Szállás neve"
                                value={day.accommodation.name}
                                onChange={(e) =>
                                    onChange({
                                        ...day,
                                        accommodation: { ...day.accommodation, name: e.target.value },
                                    })
                                }
                                placeholder="pl. Grand Hotel"
                            />
                            <Input
                                label="Típus"
                                value={day.accommodation.type}
                                onChange={(e) =>
                                    onChange({
                                        ...day,
                                        accommodation: { ...day.accommodation, type: e.target.value },
                                    })
                                }
                                placeholder="pl. 4 csillagos hotel"
                            />
                            <Input
                                label="Ár kategória"
                                value={day.accommodation.priceRange}
                                onChange={(e) =>
                                    onChange({
                                        ...day,
                                        accommodation: { ...day.accommodation, priceRange: e.target.value },
                                    })
                                }
                                placeholder="pl. 25 000 - 35 000 Ft"
                            />
                        </div>
                    </div>

                    {/* Étkezések */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Utensils className="w-5 h-5 text-primary-500" />
                            Étkezések
                        </h4>
                        <div className="space-y-4">
                            {day.meals.map((meal, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={meal.type === 'breakfast' ? 'warning' : meal.type === 'lunch' ? 'info' : 'secondary'}>
                                            {meal.type === 'breakfast' ? 'Reggeli' : meal.type === 'lunch' ? 'Ebéd' : 'Vacsora'}
                                        </Badge>
                                    </div>
                                    <Input
                                        value={meal.recommendation}
                                        onChange={(e) => handleMealChange(index, 'recommendation', e.target.value)}
                                        placeholder="Ajánlott hely"
                                    />
                                    <Input
                                        value={meal.cuisine}
                                        onChange={(e) => handleMealChange(index, 'cuisine', e.target.value)}
                                        placeholder="Konyha típus"
                                    />
                                    <Input
                                        value={meal.priceRange}
                                        onChange={(e) => handleMealChange(index, 'priceRange', e.target.value)}
                                        placeholder="Ár kategória"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Közlekedési megjegyzések
                        </label>
                        <textarea
                            value={day.transportNotes || ''}
                            onChange={(e) => onChange({ ...day, transportNotes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={2}
                            placeholder="pl. Gyalog könnyen bejárható, vagy tömegközlekedéssel..."
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

const EditItineraryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [itinerary, setItinerary] = useState<AIItinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));


    useEffect(() => {
        const loadItinerary = async () => {
            if (!id) {
                setError('Érvénytelen útiterv azonosító');
                setIsLoading(false);
                return;
            }

            try {
                const data = await itineraryService.getById(id);
                if (!data) {
                    setError('Az útiterv nem található');
                    return;
                }


                if (data.userId !== user?.id) {
                    setError('Nincs jogosultságod ennek az útitervnek a szerkesztéséhez');
                    return;
                }

                setItinerary(data);
            } catch (err) {
                console.error('Error loading itinerary:', err);
                setError('Hiba történt az útiterv betöltése közben');
            } finally {
                setIsLoading(false);
            }
        };

        loadItinerary();
    }, [id, user]);

    // Nap kinyitása/becsukása
    const toggleDay = (dayNumber: number) => {
        setExpandedDays((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dayNumber)) {
                newSet.delete(dayNumber);
            } else {
                newSet.add(dayNumber);
            }
            return newSet;
        });
    };

    // Nap módosítása
    const handleDayChange = (index: number, updatedDay: AIItineraryDay) => {
        if (!itinerary) return;

        const newDays = [...itinerary.days];
        newDays[index] = updatedDay;
        setItinerary({ ...itinerary, days: newDays });
    };

    // Nap törlése
    const handleDeleteDay = (index: number) => {
        if (!itinerary || itinerary.days.length <= 1) return;

        if (!confirm('Biztosan törölni szeretnéd ezt a napot?')) return;

        const newDays = itinerary.days.filter((_, i) => i !== index);

        const renumberedDays = newDays.map((day, i) => ({ ...day, day: i + 1 }));
        setItinerary({ ...itinerary, days: renumberedDays });
    };

    // Új nap
    const handleAddDay = () => {
        if (!itinerary) return;

        const newDayNumber = itinerary.days.length + 1;
        const newDay: AIItineraryDay = {
            day: newDayNumber,
            title: `${newDayNumber}. nap`,
            description: '',
            morning: {
                activity: '',
                description: '',
                duration: '3-4 óra',
            },
            afternoon: {
                activity: '',
                description: '',
                duration: '3-4 óra',
            },
            evening: {
                activity: '',
                description: '',
                duration: '2-3 óra',
            },
            accommodation: {
                name: '',
                type: '',
                priceRange: '',
            },
            meals: [
                { type: 'breakfast', recommendation: '', cuisine: '', priceRange: '' },
                { type: 'lunch', recommendation: '', cuisine: '', priceRange: '' },
                { type: 'dinner', recommendation: '', cuisine: '', priceRange: '' },
            ],
        };

        setItinerary({ ...itinerary, days: [...itinerary.days, newDay] });
        setExpandedDays((prev) => new Set([...prev, newDayNumber]));
    };

    // Tipp
    const handleTipChange = (index: number, value: string) => {
        if (!itinerary) return;

        const newTips = [...itinerary.tips];
        newTips[index] = value;
        setItinerary({ ...itinerary, tips: newTips });
    };


    const handleDeleteTip = (index: number) => {
        if (!itinerary) return;

        const newTips = itinerary.tips.filter((_, i) => i !== index);
        setItinerary({ ...itinerary, tips: newTips });
    };

    // Új tipp
    const handleAddTip = () => {
        if (!itinerary) return;

        setItinerary({ ...itinerary, tips: [...itinerary.tips, ''] });
    };

    // Mentés
    const handleSave = async () => {
        if (!itinerary || !id) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await itineraryService.update(id, {
                title: itinerary.title,
                summary: itinerary.summary,
                days: itinerary.days,
                tips: itinerary.tips.filter((tip) => tip.trim() !== ''),
                bestTimeToVisit: itinerary.bestTimeToVisit,
                estimatedBudget: itinerary.estimatedBudget,
            });

            setSuccessMessage('Az útiterv sikeresen mentve!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error saving itinerary:', err);
            setError('Hiba történt a mentés során. Kérjük, próbáld újra.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error && !itinerary) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Hiba történt</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link to="/itineraries">
                    <Button variant="primary">Vissza a mentett útitervekhez</Button>
                </Link>
            </div>
        );
    }

    if (!itinerary) return null;

    return (
        <div className="min-h-screen bg-sand-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/itineraries">
                                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                    Vissza
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Útiterv szerkesztése</h1>
                                <p className="text-sm text-gray-500">{itinerary.request.destination}, {itinerary.request.country}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {successMessage && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">{successMessage}</span>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                            <Button
                                variant="primary"
                                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Mentés...' : 'Mentés'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">

                    <Card padding="lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-500" />
                            Alapinformációk
                        </h2>
                        <div className="space-y-4">
                            <Input
                                label="Útiterv címe"
                                value={itinerary.title}
                                onChange={(e) => setItinerary({ ...itinerary, title: e.target.value })}
                                placeholder="pl. Párizsi kaland"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Összefoglaló</label>
                                <textarea
                                    value={itinerary.summary}
                                    onChange={(e) => setItinerary({ ...itinerary, summary: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Az utazás rövid összefoglalója..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Minimum költségvetés (HUF)"
                                    type="number"
                                    value={itinerary.estimatedBudget.min}
                                    onChange={(e) =>
                                        setItinerary({
                                            ...itinerary,
                                            estimatedBudget: {
                                                ...itinerary.estimatedBudget,
                                                min: parseInt(e.target.value) || 0,
                                            },
                                        })
                                    }
                                />
                                <Input
                                    label="Maximum költségvetés (HUF)"
                                    type="number"
                                    value={itinerary.estimatedBudget.max}
                                    onChange={(e) =>
                                        setItinerary({
                                            ...itinerary,
                                            estimatedBudget: {
                                                ...itinerary.estimatedBudget,
                                                max: parseInt(e.target.value) || 0,
                                            },
                                        })
                                    }
                                />
                                <Input
                                    label="Legjobb időszak a látogatásra"
                                    value={itinerary.bestTimeToVisit}
                                    onChange={(e) => setItinerary({ ...itinerary, bestTimeToVisit: e.target.value })}
                                    placeholder="pl. Május-Szeptember"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Napok szerkesztése */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Napokra bontott program ({itinerary.days.length} nap)
                            </h2>
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={handleAddDay}
                            >
                                Új nap hozzáadása
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {itinerary.days.map((day, index) => (
                                <DayEditor
                                    key={day.day}
                                    day={day}
                                    dayIndex={index}
                                    isExpanded={expandedDays.has(day.day)}
                                    onToggle={() => toggleDay(day.day)}
                                    onChange={(updatedDay) => handleDayChange(index, updatedDay)}
                                    onDelete={() => handleDeleteDay(index)}
                                    totalDays={itinerary.days.length}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tippek szerkesztése */}
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-500" />
                                Hasznos tippek
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={handleAddTip}
                            >
                                Új tipp
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {itinerary.tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm flex-shrink-0 mt-2">
                                        {index + 1}
                                    </span>
                                    <textarea
                                        value={tip}
                                        onChange={(e) => handleTipChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        rows={2}
                                        placeholder="Írj ide egy hasznos tippet..."
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50 mt-1"
                                        onClick={() => handleDeleteTip(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {itinerary.tips.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    Még nincsenek tippek. Kattints az "Új tipp" gombra a hozzáadáshoz.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Mentés */}
                    <div className="flex justify-end gap-4">
                        <Link to="/itineraries">
                            <Button variant="ghost">Mégse</Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="lg"
                            leftIcon={isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Mentés folyamatban...' : 'Változtatások mentése'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditItineraryPage;
