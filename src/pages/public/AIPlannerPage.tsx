import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    MapPin,
    Coffee,
    Sun,
    Moon,
    Utensils,
    Building,
    ArrowRight,
    Share2,
    Heart,
    RefreshCw,
    Lightbulb,
    AlertCircle,
    Loader2,
    Check,
} from 'lucide-react';
import { AIItineraryRequest, AIItinerary } from '../../types';
import { Button, Card, Badge } from '../../components/ui';
import { AIItineraryForm } from '../../components/features';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';


import { aiService } from '../../services/aiService';
import { imageService } from '../../services/imageService';
import { itineraryService } from '../../services/itineraryService';

const AIPlannerPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState<AIItinerary | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeDay, setActiveDay] = useState(1);

    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleGenerateItinerary = async (request: AIItineraryRequest) => {
        setIsGenerating(true);
        setError(null);

        try {

            const generatedItinerary = await aiService.generateItinerary(request);

            const activities = generatedItinerary.days.flatMap(day => [
                day.morning.activity,
                day.afternoon.activity,
            ]);

            const imagesMap = await imageService.getItineraryImages(
                request.destination,
                activities
            );


            const itineraryWithImages: AIItinerary = {
                ...generatedItinerary,
                days: generatedItinerary.days.map(day => ({
                    ...day,

                    image: imagesMap.get(day.morning.activity) ||
                        imagesMap.get(day.afternoon.activity) ||
                        imagesMap.get('main'),
                })),
            };

            setItinerary(itineraryWithImages);
            setActiveDay(1);
        } catch (err) {
            console.error(err);
            setError('Hiba történt az útiterv generálása közben. Kérjük, próbáld újra később, vagy ellenőrizd az internetkapcsolatodat.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setItinerary(null);
        setActiveDay(1);
        setError(null);
        setIsSaved(false);
    };

    const handleSaveItinerary = async () => {
        if (!user || !itinerary) return;

        setIsSaving(true);
        try {
            await itineraryService.save(user.id, itinerary);
            setIsSaved(true);
        } catch (err) {
            console.error('Failed to save itinerary:', err);
            setError('Nem sikerült menteni az útitervet. Kérjük, próbálja újra.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (!itinerary) return;
        
        const shareData = {
            title: itinerary.title,
            text: itinerary.summary,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: másolás vágólapra
            navigator.clipboard.writeText(window.location.href);
            alert('Link másolva a vágólapra!');
        }
    };

    return (
        <div className="min-h-screen bg-sand-50">
            {/* Hero Section */}
            <section className="relative py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700" />
                <div className="absolute inset-0 bg-hero-pattern opacity-20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                        <Sparkles className="w-5 h-5 text-secondary-300" />
                        <span className="text-white font-medium">Mesterséges intelligencia</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                        AI Útitervező
                    </h1>
                    <p className="text-xl text-primary-100/90 max-w-2xl mx-auto">
                        Adja meg preferenciáit, és mesterséges intelligenciánk pillanatok alatt
                        személyre szabott, napokra bontott útitervet készít Önnek.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {error && (
                    <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {!itinerary ? (
                    // Form View
                    <div className="max-w-3xl mx-auto">
                        {isGenerating ? (
                            // Loading State
                            <Card padding="lg" className="text-center py-16">
                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary-500" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
                                    Útiterv generálása...
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    A mesterséges intelligencia éppen összeállítja az Ön számára tökéletes útitervet.
                                    Ez eltarthat néhány másodpercig. Kérjük, légy türelemmel!
                                </p>
                                <div className="mt-8 flex justify-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 rounded-full bg-primary-500 animate-bounce"
                                            style={{ animationDelay: `${i * 150}ms` }}
                                        />
                                    ))}
                                </div>
                            </Card>
                        ) : (
                            <AIItineraryForm onSubmit={handleGenerateItinerary} isLoading={isGenerating} />
                        )}
                    </div>
                ) : (

                    <div className="space-y-8">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <Badge variant="success" className="mb-3">
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    AI által generált
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                                    {itinerary.title}
                                </h2>
                                <p className="text-gray-600 max-w-2xl">{itinerary.summary}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="w-5 h-5" />}>
                                    Új tervezés
                                </Button>
                                {isAuthenticated ? (
                                    <>
                                        <Button 
                                            variant={isSaved ? "primary" : "secondary"} 
                                            onClick={handleSaveItinerary}
                                            disabled={isSaving || isSaved}
                                            leftIcon={isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                                        >
                                            {isSaved ? 'Mentve!' : isSaving ? 'Mentés...' : 'Mentés'}
                                        </Button>
                                        <Button variant="secondary" onClick={handleShare} leftIcon={<Share2 className="w-5 h-5" />}>
                                            Megosztás
                                        </Button>
                                        {isSaved && (
                                            <Link to="/itineraries">
                                                <Button variant="ghost">
                                                    Mentett útiterveim →
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <Link to="/login">
                                        <Button variant="primary" leftIcon={<Heart className="w-5 h-5" />}>
                                            Bejelentkezés a mentéshez
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <Card padding="lg" className="bg-gradient-to-r from-primary-50 to-secondary-50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Becsült költségkeret</h3>
                                    <p className="text-3xl font-bold text-primary-600">
                                        {formatCurrency(itinerary.estimatedBudget.min)} - {formatCurrency(itinerary.estimatedBudget.max)}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">/ fő, tartalmazza a szállást, étkezést és programokat</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{itinerary.days.length}</p>
                                        <p className="text-sm text-gray-500">nap</p>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200" />
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{itinerary.days.length - 1}</p>
                                        <p className="text-sm text-gray-500">éjszaka</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Day Navigation */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {itinerary.days.map((day) => (
                                <button
                                    key={day.day}
                                    onClick={() => setActiveDay(day.day)}
                                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${
                                        activeDay === day.day
                                            ? 'bg-primary-500 text-white shadow-glow'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {day.day}. nap
                                </button>
                            ))}
                        </div>

                        {/* Day Detail */}
                        {itinerary.days.filter(d => d.day === activeDay).map((day) => (
                            <div key={day.day} className="space-y-6">

                                {day.image && (
                                    <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-md">
                                        <img
                                            src={day.image}
                                            alt={day.title}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                )}

                                <Card padding="lg" className="animate-fade-in">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Timeline */}
                                        <div className="flex-1 space-y-6">
                                            <div className="mb-6">
                                                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                                    {day.title}
                                                </h3>
                                                <p className="text-gray-600">{day.description}</p>
                                            </div>

                                            {/* Morning */}
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                                        <Sun className="w-6 h-6 text-amber-600" />
                                                    </div>
                                                    <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="warning" size="sm">Délelőtt</Badge>
                                                        <span className="text-sm text-gray-500">{day.morning.duration}</span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{day.morning.activity}</h4>
                                                    <p className="text-gray-600 mb-2">{day.morning.description}</p>
                                                    {day.morning.location && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" /> {day.morning.location}
                                                        </p>
                                                    )}
                                                    {day.morning.tips && (
                                                        <p className="text-sm text-primary-600 mt-2 flex items-center gap-1">
                                                            <Lightbulb className="w-4 h-4" /> {day.morning.tips}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Afternoon */}
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Coffee className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="info" size="sm">Délután</Badge>
                                                        <span className="text-sm text-gray-500">{day.afternoon.duration}</span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{day.afternoon.activity}</h4>
                                                    <p className="text-gray-600 mb-2">{day.afternoon.description}</p>
                                                    {day.afternoon.location && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" /> {day.afternoon.location}
                                                        </p>
                                                    )}
                                                    {day.afternoon.cost && (
                                                        <p className="text-sm text-gray-500">Becsült költség: {day.afternoon.cost}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Evening */}
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <Moon className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" size="sm">Este</Badge>
                                                        <span className="text-sm text-gray-500">{day.evening.duration}</span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{day.evening.activity}</h4>
                                                    <p className="text-gray-600 mb-2">{day.evening.description}</p>
                                                    {day.evening.location && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" /> {day.evening.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sidebar */}
                                        <div className="lg:w-80 space-y-6">
                                            {/* Accommodation */}
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Building className="w-5 h-5 text-primary-500" />
                                                    <h4 className="font-semibold text-gray-900">Szállás</h4>
                                                </div>
                                                <p className="font-medium text-gray-900">{day.accommodation.name}</p>
                                                <p className="text-sm text-gray-500">{day.accommodation.type}</p>
                                                <p className="text-sm text-primary-600 mt-1">{day.accommodation.priceRange}</p>
                                            </div>

                                            {/* Meals */}
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Utensils className="w-5 h-5 text-primary-500" />
                                                    <h4 className="font-semibold text-gray-900">Étkezés</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {day.meals.map((meal, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium text-gray-900 capitalize">
                                                                    {meal.type === 'breakfast' ? 'Reggeli' : meal.type === 'lunch' ? 'Ebéd' : 'Vacsora'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">{meal.recommendation}</p>
                                                            </div>
                                                            <span className="text-sm text-gray-400">{meal.priceRange}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}

                        {/* Tips */}
                        <Card padding="lg">
                            <h3 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Lightbulb className="w-6 h-6 text-amber-500" />
                                Hasznos tippek
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {itinerary.tips.map((tip, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                                        <p className="text-gray-700">{tip}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-secondary-50 rounded-xl">
                                <p className="text-secondary-700">
                                    <strong>Legjobb időszak a látogatásra:</strong> {itinerary.bestTimeToVisit}
                                </p>
                            </div>
                        </Card>

                        {/* CTA */}
                        <Card padding="lg" className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-display font-bold mb-2">
                                        Tetszik az útiterv?
                                    </h3>
                                    <p className="text-white/80">
                                        Foglaljon most, és mi segítünk megvalósítani az álomutazást!
                                    </p>
                                </div>
                                <Link to="/packages">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="bg-white hover:bg-gray-50 text-gray-900"
                                        rightIcon={<ArrowRight className="w-5 h-5" />}
                                    >
                                        Utazások böngészése
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPlannerPage;