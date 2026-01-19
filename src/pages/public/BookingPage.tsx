import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    MapPin,
    Users,
    Clock,
    Check,
    CreditCard,
    User,
    Mail,
    Phone,
    FileText,
    Loader2,
    AlertCircle,
    CheckCircle,
    Plus,
    Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { packageService } from '../../services/packageService';
import { bookingService, CreateBookingData } from '../../services/bookingService';
import { TravelPackage, Traveler } from '../../types';
import { Card, Button, Input, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface TravelerFormData {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    passportNumber: string;
}

const BookingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [travelPackage, setTravelPackage] = useState<TravelPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);

    // Form state
    const [travelers, setTravelers] = useState<TravelerFormData[]>([
        { name: user?.name || '', email: user?.email || '', phone: user?.phone || '', dateOfBirth: '', passportNumber: '' }
    ]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    useEffect(() => {
        const loadPackage = async () => {
            if (!slug) return;

            try {
                const pkg = await packageService.getBySlug(slug);
                if (!pkg) {
                    navigate('/packages');
                    return;
                }
                setTravelPackage(pkg);
            } catch (error) {
                console.error('Error loading package:', error);
                navigate('/packages');
            } finally {
                setIsLoading(false);
            }
        };

        loadPackage();
    }, [slug, navigate]);


    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login', { state: { from: `/packages/${slug}/booking` } });
        }
    }, [isAuthenticated, isLoading, navigate, slug]);

    const addTraveler = () => {
        if (travelPackage && travelers.length < travelPackage.maxGroupSize) {
            setTravelers([...travelers, { name: '', email: '', phone: '', dateOfBirth: '', passportNumber: '' }]);
        }
    };

    const removeTraveler = (index: number) => {
        if (travelers.length > 1) {
            setTravelers(travelers.filter((_, i) => i !== index));
        }
    };

    const updateTraveler = (index: number, field: keyof TravelerFormData, value: string) => {
        const updated = [...travelers];
        updated[index] = { ...updated[index], [field]: value };
        setTravelers(updated);
    };

    const validateStep = (step: number): boolean => {
        setError(null);

        if (step === 1) {
            // Validate
            for (let i = 0; i < travelers.length; i++) {
                const t = travelers[i];
                if (!t.name.trim()) {
                    setError(`Kérjük adja meg a(z) ${i + 1}. utas nevét!`);
                    return false;
                }
                if (!t.email.trim() || !t.email.includes('@')) {
                    setError(`Kérjük adjon meg érvényes email címet a(z) ${i + 1}. utashoz!`);
                    return false;
                }
            }
        }

        if (step === 2 && !acceptTerms) {
            setError('Kérjük fogadja el az Általános Szerződési Feltételeket!');
            return false;
        }

        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const calculateTotalPrice = (): number => {
        if (!travelPackage) return 0;
        return travelPackage.price * travelers.length;
    };

    const handleSubmitBooking = async () => {
        if (!travelPackage || !user || !validateStep(2)) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const bookingData: CreateBookingData = {
                userId: user.id,
                packageId: travelPackage.id,
                travelers: travelers.map(t => ({
                    name: t.name,
                    email: t.email,
                    phone: t.phone || undefined,
                    dateOfBirth: t.dateOfBirth || undefined,
                    passportNumber: t.passportNumber || undefined,
                })),
                totalPrice: calculateTotalPrice(),
                specialRequests: specialRequests || undefined,
            };

            const booking = await bookingService.create(bookingData);
            
            // Update
            await packageService.decreaseAvailableSpots(travelPackage.id, travelers.length);

            setBookingId(booking.id);
            setBookingComplete(true);
            setCurrentStep(3);
        } catch (error) {
            console.error('Booking error:', error);
            setError('Nem sikerült leadni a foglalást. Kérjük próbálja újra később.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!travelPackage) {
        return null;
    }

    const steps = [
        { number: 1, title: 'Utasok adatai' },
        { number: 2, title: 'Áttekintés' },
        { number: 3, title: 'Kész' },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">

            <Link
                to={`/packages/${slug}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Vissza a csomaghoz
            </Link>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                    currentStep >= step.number
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {currentStep > step.number ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span className={`text-sm mt-2 ${
                                    currentStep >= step.number ? 'text-primary-600 font-medium' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded ${
                                    currentStep > step.number ? 'bg-primary-500' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}


                    {currentStep === 1 && (
                        <Card padding="lg">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                <Users className="w-5 h-5 inline mr-2" />
                                Utasok adatai
                            </h2>

                            <div className="space-y-6">
                                {travelers.map((traveler, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-gray-900">
                                                {index + 1}. utas {index === 0 && '(Kapcsolattartó)'}
                                            </h3>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTraveler(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <User className="w-4 h-4 inline mr-1" />
                                                    Teljes név *
                                                </label>
                                                <Input
                                                    value={traveler.name}
                                                    onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                                    placeholder="Vezetéknév Keresztnév"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Mail className="w-4 h-4 inline mr-1" />
                                                    Email cím *
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={traveler.email}
                                                    onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Phone className="w-4 h-4 inline mr-1" />
                                                    Telefonszám
                                                </label>
                                                <Input
                                                    value={traveler.phone}
                                                    onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                                                    placeholder="+36 XX XXX XXXX"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Calendar className="w-4 h-4 inline mr-1" />
                                                    Születési dátum
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={traveler.dateOfBirth}
                                                    onChange={(e) => updateTraveler(index, 'dateOfBirth', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <FileText className="w-4 h-4 inline mr-1" />
                                                    Útlevél szám (opcionális)
                                                </label>
                                                <Input
                                                    value={traveler.passportNumber}
                                                    onChange={(e) => updateTraveler(index, 'passportNumber', e.target.value)}
                                                    placeholder="Útlevél szám"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {travelers.length < travelPackage.availableSpots && travelers.length < travelPackage.maxGroupSize && (
                                    <Button
                                        variant="ghost"
                                        leftIcon={<Plus className="w-4 h-4" />}
                                        onClick={addTraveler}
                                        className="w-full"
                                    >
                                        További utas hozzáadása
                                    </Button>
                                )}
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Különleges kérések (opcionális)
                                </label>
                                <textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    placeholder="Pl. étel allergia, mozgáskorlátozottság, stb."
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="primary"
                                    rightIcon={<ArrowRight className="w-4 h-4" />}
                                    onClick={nextStep}
                                >
                                    Tovább az áttekintéshez
                                </Button>
                            </div>
                        </Card>
                    )}


                    {currentStep === 2 && (
                        <Card padding="lg">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                <FileText className="w-5 h-5 inline mr-2" />
                                Foglalás áttekintése
                            </h2>

                            {/* Package */}
                            <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="flex gap-4">
                                    <img
                                        src={travelPackage.coverImage}
                                        alt={travelPackage.title}
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{travelPackage.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {travelPackage.destination}, {travelPackage.country}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(travelPackage.departureDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {travelPackage.duration} nap
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Travelers */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-3">Utasok ({travelers.length} fő)</h3>
                                <div className="space-y-2">
                                    {travelers.map((traveler, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{traveler.name}</p>
                                                <p className="text-sm text-gray-500">{traveler.email}</p>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(travelPackage.price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Special*/}
                            {specialRequests && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-2">Különleges kérések</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{specialRequests}</p>
                                </div>
                            )}

                            {/* Terms */}
                            <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Elolvastam és elfogadom az{' '}
                                        <a href="/terms" className="text-primary-600 hover:underline">
                                            Általános Szerződési Feltételeket
                                        </a>{' '}
                                        és az{' '}
                                        <a href="/privacy" className="text-primary-600 hover:underline">
                                            Adatvédelmi Szabályzatot
                                        </a>.
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    variant="ghost"
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                    onClick={prevStep}
                                >
                                    Vissza
                                </Button>
                                <Button
                                    variant="primary"
                                    leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                    onClick={handleSubmitBooking}
                                    disabled={isSubmitting || !acceptTerms}
                                >
                                    Foglalás véglegesítése
                                </Button>
                            </div>
                        </Card>
                    )}


                    {currentStep === 3 && bookingComplete && (
                        <Card padding="lg" className="text-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Foglalás sikeresen leadva!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Köszönjük foglalását! Hamarosan email-ben értesítjük a foglalás megerősítéséről.
                            </p>
                            
                            {bookingId && (
                                <div className="p-4 bg-gray-50 rounded-xl mb-6 inline-block">
                                    <p className="text-sm text-gray-500">Foglalási azonosító</p>
                                    <p className="font-mono font-semibold text-gray-900">{bookingId}</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/bookings">
                                    <Button variant="primary">
                                        Foglalásaim megtekintése
                                    </Button>
                                </Link>
                                <Link to="/packages">
                                    <Button variant="ghost">
                                        További utazások
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar  */}
                <div className="lg:col-span-1">
                    <Card padding="lg" className="sticky top-24">
                        <h3 className="font-semibold text-gray-900 mb-4">Összesítés</h3>

                        <div className="flex gap-3 mb-4">
                            <img
                                src={travelPackage.coverImage}
                                alt={travelPackage.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                    {travelPackage.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 inline" /> {travelPackage.destination}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Indulás
                                </span>
                                <span className="text-gray-900">{formatDate(travelPackage.departureDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Időtartam
                                </span>
                                <span className="text-gray-900">{travelPackage.duration} nap</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Utasok
                                </span>
                                <span className="text-gray-900">{travelers.length} fő</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ár/fő</span>
                                <span className="text-gray-900">{formatCurrency(travelPackage.price)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Utasok száma</span>
                                <span className="text-gray-900">× {travelers.length}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 mt-4 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Összesen</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {formatCurrency(calculateTotalPrice())}
                                </span>
                            </div>
                        </div>

                        {travelPackage.availableSpots <= 5 && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                <p className="text-sm text-amber-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Már csak {travelPackage.availableSpots} hely maradt!
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
