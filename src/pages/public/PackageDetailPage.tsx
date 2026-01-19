import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Clock,
    Users,
    Star,
    Calendar,
    Check,
    X,
    ArrowLeft,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button, Card, Badge, Modal } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { packageService } from '../../services/packageService';
import { bookingService } from '../../services/bookingService';
import { TravelPackage } from '../../types';
import {
    formatCurrency,
    formatDate,
    getCategoryLabel,
    calculateDiscount,
    formatDuration,
    cn,
} from '../../utils/helpers';

const PackageDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [pkg, setPkg] = useState<TravelPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [travelers, setTravelers] = useState(1);
    const [isBookingLoading, setIsBookingLoading] = useState(false);


    useEffect(() => {
        const loadPackage = async () => {
            if (!slug) return;
            try {
                const data = await packageService.getBySlug(slug);
                setPkg(data);
            } catch (error) {
                console.error('Failed to load package:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPackage();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sand-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen bg-sand-50 flex items-center justify-center">
                <Card padding="lg" className="text-center max-w-md">
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                        Utazás nem található
                    </h2>
                    <p className="text-gray-600 mb-6">
                        A keresett utazási csomag nem létezik vagy már nem elérhető.
                    </p>
                    <Link to="/packages">
                        <Button variant="primary">Vissza az utazásokhoz</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const discount = calculateDiscount(pkg.originalPrice || 0, pkg.price);
    const totalPrice = pkg.price * travelers;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % pkg.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + pkg.images.length) % pkg.images.length);
    };

    const handleBookingClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/packages/${slug}/booking` } });
            return;
        }

        navigate(`/packages/${slug}/booking`);
    };


    const confirmBooking = async () => {
        if (!user || !pkg) return;

        setIsBookingLoading(true);
        try {

            const booking = await bookingService.create({
                userId: user.id,
                packageId: pkg.id,
                totalPrice: totalPrice,
                currency: 'HUF',
                travelers: Array(travelers).fill({

                    name: user.name,
                    email: user.email
                }),
                specialRequests: '',
            });

            await packageService.decreaseAvailableSpots(pkg.id, travelers);

            setShowBookingModal(false);

            navigate('/profile');

        } catch (error) {
            console.error('Booking failed:', error);
            alert('Hiba történt a foglalás során. Kérjük, próbálja újra.');
        } finally {
            setIsBookingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sand-50">
            {/* Back */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Vissza az utazásokhoz
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">

                        <Card padding="none" className="overflow-hidden">
                            <div className="relative aspect-[16/10]">
                                <img
                                    src={pkg.images[currentImageIndex]}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover"
                                />
                                {pkg.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
                                    {pkg.isFeatured && <Badge variant="warning">Kiemelt</Badge>}
                                </div>

                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {pkg.images.length}
                                </div>
                            </div>

                            {pkg.images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {pkg.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={cn(
                                                'flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all',
                                                index === currentImageIndex
                                                    ? 'border-primary-500'
                                                    : 'border-transparent opacity-70 hover:opacity-100'
                                            )}
                                        >
                                            <img src={image} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Card>


                        <Card padding="lg">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge variant="primary">{getCategoryLabel(pkg.category)}</Badge>
                                <Badge variant="secondary">{pkg.continent}</Badge>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-semibold">{pkg.rating}</span>
                                    <span className="text-gray-500">({pkg.reviewCount} értékelés)</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                                {pkg.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                    {pkg.destination}, {pkg.country}
                </span>
                                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                                    {formatDuration(pkg.duration)}
                </span>
                                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  Max {pkg.maxGroupSize} fő
                </span>
                                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                                    {formatDate(pkg.departureDate)}
                </span>
                            </div>

                            <p className="text-gray-700 text-lg leading-relaxed">{pkg.description}</p>
                        </Card>


                        <Card padding="lg">
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                                Utazás fénypontjai
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pkg.highlights.map((highlight, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <Star className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <span className="text-gray-700">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card padding="lg">
                                <h3 className="text-xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    Az ár tartalmazza
                                </h3>
                                <ul className="space-y-3">
                                    {pkg.included.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>

                            <Card padding="lg">
                                <h3 className="text-xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <X className="w-5 h-5 text-red-500" />
                                    Az ár nem tartalmazza
                                </h3>
                                <ul className="space-y-3">
                                    {pkg.notIncluded.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>

                        {/* Itinerary */}
                        {pkg.itinerary && pkg.itinerary.length > 0 && (
                            <Card padding="lg">
                                <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                                    Útiterv
                                </h2>
                                <div className="space-y-6">
                                    {pkg.itinerary.map((day, index) => (
                                        <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary-200 last:border-transparent last:pb-0">
                                            <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-primary-500" />
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Badge variant="primary">{day.day}. nap</Badge>
                                                    <h4 className="text-lg font-semibold text-gray-900">{day.title}</h4>
                                                </div>
                                                <p className="text-gray-600 mb-4">{day.description}</p>
                                                {day.activities.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {day.activities.map((activity, i) => (
                                                            <Badge key={i} variant="secondary" size="sm">
                                                                {activity}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card padding="lg">
                                <div className="mb-6">
                                    {pkg.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(pkg.originalPrice)}
                    </span>
                                    )}
                                    <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatCurrency(pkg.price)}
                    </span>
                                        <span className="text-gray-500">/ fő</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">Indulás</span>
                                        <span className="font-semibold">{formatDate(pkg.departureDate)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">Visszaérkezés</span>
                                        <span className="font-semibold">{formatDate(pkg.returnDate)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">Szabad helyek</span>
                                        <Badge variant={pkg.availableSpots <= 5 ? 'warning' : 'success'}>
                                            {pkg.availableSpots} fő
                                        </Badge>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Utazók száma
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                                                className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-400 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-xl font-semibold w-8 text-center">{travelers}</span>
                                            <button
                                                onClick={() => setTravelers(Math.min(pkg.availableSpots, travelers + 1))}
                                                className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-400 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between text-lg">
                                        <span className="text-gray-600">Összesen:</span>
                                        <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full mb-4"
                                    onClick={handleBookingClick}
                                    disabled={pkg.availableSpots === 0}
                                >
                                    {pkg.availableSpots === 0 ? 'Betelt' : 'Foglalás'}
                                </Button>

                                <div className="flex gap-3">
                                    <Button variant="secondary" className="flex-1">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                    <Button variant="secondary" className="flex-1">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                title="Foglalás megerősítése"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{pkg.title}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Indulás: {formatDate(pkg.departureDate)}</p>
                            <p>Utazók száma: {travelers} fő</p>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                                Összesen: {formatCurrency(totalPrice)}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600">
                        A foglalás megerősítésével létrejön egy függőben lévő foglalás.
                        Munkatársunk hamarosan keresni fogja a részletekkel, vagy átirányítjuk a fizetési oldalra.
                    </p>

                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowBookingModal(false)}
                            disabled={isBookingLoading}
                        >
                            Mégsem
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={confirmBooking}
                            isLoading={isBookingLoading}
                        >
                            Foglalás véglegesítése
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PackageDetailPage;