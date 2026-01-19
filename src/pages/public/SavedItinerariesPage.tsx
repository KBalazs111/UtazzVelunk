import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Map,
    Calendar,
    Clock,
    MapPin,
    Sparkles,
    Trash2,
    Eye,
    Share2,
    Copy,
    Check,
    Loader2,
    ChevronRight,
    Wallet,
    Edit,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { itineraryService } from '../../services/itineraryService';
import { AIItinerary } from '../../types';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';

const SavedItinerariesPage: React.FC = () => {
    const { user } = useAuth();
    const [itineraries, setItineraries] = useState<AIItinerary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItinerary, setSelectedItinerary] = useState<AIItinerary | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        const loadItineraries = async () => {
            if (!user) return;

            try {
                const userItineraries = await itineraryService.getByUserId(user.id);
                setItineraries(userItineraries);
            } catch (error) {
                console.error('Error loading itineraries:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadItineraries();
    }, [user]);

    const handleDelete = async (itineraryId: string) => {
        if (!confirm('Biztosan törölni szeretné ezt az útitervet?')) return;

        setIsDeleting(true);
        try {
            await itineraryService.delete(itineraryId);
            setItineraries(prev => prev.filter(i => i.id !== itineraryId));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting itinerary:', error);
            alert('Nem sikerült törölni az útitervet.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopyLink = (itineraryId: string) => {
        const link = itineraryService.generateShareLink(itineraryId);
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const openItineraryDetails = (itinerary: AIItinerary) => {
        setSelectedItinerary(itinerary);
        setIsModalOpen(true);
    };

    const getTravelStyleLabel = (style: string): string => {
        const labels: Record<string, string> = {
            relaxed: 'Nyugodt',
            balanced: 'Kiegyensúlyozott',
            adventurous: 'Kalandos',
            luxury: 'Luxus'
        };
        return labels[style] || style;
    };

    const getGroupTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            solo: 'Egyedül',
            couple: 'Páros',
            family: 'Családi',
            friends: 'Baráti',
            business: 'Üzleti'
        };
        return labels[type] || type;
    };

    const getBudgetLabel = (budget: string): string => {
        const labels: Record<string, string> = {
            budget: 'Gazdaságos',
            moderate: 'Közepes',
            premium: 'Prémium',
            luxury: 'Luxus'
        };
        return labels[budget] || budget;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Mentett útiterveim</h1>
                    <p className="text-gray-500 mt-1">Az AI által generált és elmentett útiterveid</p>
                </div>
                <Link to="/ai-planner">
                    <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                        Új útiterv készítése
                    </Button>
                </Link>
            </div>

            {itineraries.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                    <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Még nincs mentett útiterved
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Használd az AI útiterv-generátort, hogy személyre szabott úti terveket készíts, 
                        majd mentsd el őket ide későbbi felhasználásra!
                    </p>
                    <Link to="/ai-planner">
                        <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                            AI Útitervező kipróbálása
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map(itinerary => (
                        <Card key={itinerary.id} padding="none" hover className="overflow-hidden">
                            {/* Header Image */}
                            <div className="relative h-40">
                                <img
                                    src={`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80&fit=crop`}
                                    alt={itinerary.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                                        {itinerary.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {itinerary.request.destination}, {itinerary.request.country}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <Badge variant="primary" className="bg-white/90 text-primary-700">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        AI
                                    </Badge>
                                </div>
                            </div>


                            <div className="p-4">
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {itinerary.summary}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="secondary">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {itinerary.request.duration} nap
                                    </Badge>
                                    <Badge variant="secondary">
                                        {getGroupTypeLabel(itinerary.request.groupType)}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {getBudgetLabel(itinerary.request.budget)}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Wallet className="w-4 h-4" />
                                        {formatCurrency(itinerary.estimatedBudget.min)} - {formatCurrency(itinerary.estimatedBudget.max)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {itinerary.createdAt.toLocaleDateString('hu-HU')}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                        leftIcon={<Eye className="w-4 h-4" />}
                                        onClick={() => openItineraryDetails(itinerary)}
                                    >
                                        Megtekintés
                                    </Button>
                                    <Link to={`/itinerary/edit/${itinerary.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Edit className="w-4 h-4" />}
                                            className="text-primary-600 hover:bg-primary-50"
                                        >
                                            Szerkesztés
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Share2 className="w-4 h-4" />}
                                        onClick={() => handleCopyLink(itinerary.id)}
                                    >
                                        {copiedLink ? <Check className="w-4 h-4" /> : null}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50"
                                        leftIcon={<Trash2 className="w-4 h-4" />}
                                        onClick={() => handleDelete(itinerary.id)}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItinerary?.title || 'Útiterv részletei'}
                size="xl"
            >
                {selectedItinerary && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Summary */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                            <p className="text-gray-700">{selectedItinerary.summary}</p>
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <MapPin className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-500">Úti cél</p>
                                <p className="font-medium text-gray-900">
                                    {selectedItinerary.request.destination}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-500">Időtartam</p>
                                <p className="font-medium text-gray-900">
                                    {selectedItinerary.request.duration} nap
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <Sparkles className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-500">Stílus</p>
                                <p className="font-medium text-gray-900">
                                    {getTravelStyleLabel(selectedItinerary.request.travelStyle)}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <Wallet className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-500">Költségkeret</p>
                                <p className="font-medium text-gray-900">
                                    {getBudgetLabel(selectedItinerary.request.budget)}
                                </p>
                            </div>
                        </div>


                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Napokra bontott program</h4>
                            <div className="space-y-4">
                                {selectedItinerary.days.map((day, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                <span className="font-bold text-primary-600">{day.day}</span>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-900">{day.title}</h5>
                                                <p className="text-sm text-gray-500">{day.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                            <div className="p-3 bg-amber-50 rounded-lg">
                                                <p className="text-xs font-medium text-amber-700 mb-1">☀️ Délelőtt</p>
                                                <p className="text-sm text-gray-700">{day.morning.activity}</p>
                                                <p className="text-xs text-gray-500 mt-1">{day.morning.duration}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <p className="text-xs font-medium text-blue-700 mb-1">🌤️ Délután</p>
                                                <p className="text-sm text-gray-700">{day.afternoon.activity}</p>
                                                <p className="text-xs text-gray-500 mt-1">{day.afternoon.duration}</p>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg">
                                                <p className="text-xs font-medium text-purple-700 mb-1">🌙 Este</p>
                                                <p className="text-sm text-gray-700">{day.evening.activity}</p>
                                                <p className="text-xs text-gray-500 mt-1">{day.evening.duration}</p>
                                            </div>
                                        </div>

                                        {day.accommodation && (
                                            <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <span className="text-sm">🏨</span>
                                                <span className="text-sm text-gray-600">
                                                    {day.accommodation.name} ({day.accommodation.type}) - {day.accommodation.priceRange}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="p-4 bg-green-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">Becsült költségkeret</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(selectedItinerary.estimatedBudget.min)} - {formatCurrency(selectedItinerary.estimatedBudget.max)}
                            </p>
                        </div>

                        {/* Tips */}
                        {selectedItinerary.tips.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">💡 Hasznos tippek</h4>
                                <ul className="space-y-2">
                                    {selectedItinerary.tips.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}


                        <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-1">🗓️ Legjobb időszak az utazásra</h4>
                            <p className="text-gray-700">{selectedItinerary.bestTimeToVisit}</p>
                        </div>


                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <Link to={`/itinerary/edit/${selectedItinerary.id}`}>
                                <Button
                                    variant="primary"
                                    leftIcon={<Edit className="w-4 h-4" />}
                                >
                                    Szerkesztés
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                leftIcon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                onClick={() => handleCopyLink(selectedItinerary.id)}
                            >
                                {copiedLink ? 'Link másolva!' : 'Link másolása'}
                            </Button>
                            <Button
                                variant="danger"
                                leftIcon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                onClick={() => handleDelete(selectedItinerary.id)}
                                disabled={isDeleting}
                            >
                                Törlés
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SavedItinerariesPage;
