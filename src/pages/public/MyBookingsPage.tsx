import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ChevronRight,
    Loader2,
    Package,
    AlertCircle,
    CheckCircle,
    XCircle,
    CreditCard,
    Eye,
    X,
    Edit,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { packageService } from '../../services/packageService';
import { Booking, TravelPackage, BookingStatus } from '../../types';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { formatCurrency, formatDate, getBookingStatusInfo, getPaymentStatusInfo } from '../../utils/helpers';
import EditBookingModal from '../../components/features/EditBookingModal';

interface BookingWithPackage extends Booking {
    packageDetails?: TravelPackage;
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

const MyBookingsPage: React.FC = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<BookingWithPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingWithPackage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<BookingWithPackage | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');

    useEffect(() => {
        const loadBookings = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const userBookings = await bookingService.getByUserId(user.id);


                const bookingsWithPackages = await Promise.all(
                    userBookings.map(async (booking) => {
                        try {
                            const packageDetails = await packageService.getById(booking.packageId);
                            return { ...booking, packageDetails: packageDetails || undefined };
                        } catch {
                            return { ...booking, packageDetails: undefined };
                        }
                    })
                );

                setBookings(bookingsWithPackages);
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBookings();
    }, [user]);

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Biztosan le szeretné mondani ezt a foglalást?')) return;

        setIsCancelling(true);
        try {
            await bookingService.cancel(bookingId);
            setBookings(prev =>
                prev.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
                )
            );
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Nem sikerült lemondani a foglalást.');
        } finally {
            setIsCancelling(false);
        }
    };

    const openBookingDetails = (booking: BookingWithPackage) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const openEditModal = (booking: BookingWithPackage) => {
        setEditingBooking(booking);
        setIsEditModalOpen(true);
    };

    const handleBookingUpdate = (updatedBooking: Booking) => {
        setBookings(prev =>
            prev.map(b =>
                b.id === updatedBooking.id
                    ? { ...b, ...updatedBooking }
                    : b
            )
        );

        if (selectedBooking?.id === updatedBooking.id) {
            setSelectedBooking({ ...selectedBooking, ...updatedBooking });
        }
    };

    const getStatusIcon = (status: BookingStatus) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getBadgeVariant = (color: string): BadgeVariant => {
        const map: Record<string, BadgeVariant> = {
            'amber': 'warning',
            'green': 'success',
            'red': 'danger',
            'blue': 'info',
            'gray': 'secondary'
        };
        return map[color] || 'secondary';
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'active') {
            return ['pending', 'confirmed'].includes(booking.status);
        }
        if (activeTab === 'past') {
            return ['completed', 'cancelled'].includes(booking.status);
        }
        return true;
    });

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
                <h1 className="text-3xl font-display font-bold text-gray-900">Foglalásaim</h1>
                <Link to="/packages">
                    <Button variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Új foglalás
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { key: 'all', label: 'Összes', count: bookings.length },
                    { key: 'active', label: 'Aktív', count: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length },
                    { key: 'past', label: 'Lezárt', count: bookings.filter(b => ['completed', 'cancelled'].includes(b.status)).length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === tab.key
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === tab.key
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {tab.count}
                        </span>
                        {activeTab === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                        )}
                    </button>
                ))}
            </div>

            {filteredBookings.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activeTab === 'all'
                            ? 'Még nincs foglalása'
                            : activeTab === 'active'
                                ? 'Nincs aktív foglalása'
                                : 'Nincs lezárt foglalása'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Böngéssze át utazási ajánlatainkat és foglaljon most!
                    </p>
                    <Link to="/packages">
                        <Button variant="primary">
                            Utazások böngészése
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map(booking => {
                        const statusInfo = getBookingStatusInfo(booking.status);
                        const paymentInfo = getPaymentStatusInfo(booking.paymentStatus);

                        return (
                            <Card key={booking.id} padding="none" hover className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Package  */}
                                    <div className="md:w-48 h-32 md:h-auto">
                                        <img
                                            src={booking.packageDetails?.coverImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400'}
                                            alt={booking.packageDetails?.title || 'Utazás'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 p-4 md:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(booking.status)}
                                                    <Badge variant={getBadgeVariant(statusInfo.color)}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                    <Badge variant={getBadgeVariant(paymentInfo.color)}>
                                                        <CreditCard className="w-3 h-3 mr-1" />
                                                        {paymentInfo.label}
                                                    </Badge>
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {booking.packageDetails?.title || 'Törölt csomag'}
                                                </h3>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    {booking.packageDetails && (
                                                        <>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {booking.packageDetails.destination}, {booking.packageDetails.country}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(booking.packageDetails.departureDate)}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {booking.travelers.length} utas
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(booking.totalPrice)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Foglalva: {formatDate(booking.bookedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                leftIcon={<Eye className="w-4 h-4" />}
                                                onClick={() => openBookingDetails(booking)}
                                            >
                                                Részletek
                                            </Button>
                                            {['pending', 'confirmed'].includes(booking.status) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Edit className="w-4 h-4" />}
                                                    onClick={() => openEditModal(booking)}
                                                    className="text-primary-600 hover:bg-primary-50"
                                                >
                                                    Módosítás
                                                </Button>
                                            )}
                                            {booking.packageDetails && (
                                                <Link to={`/packages/${booking.packageDetails.slug}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Csomag megtekintése
                                                    </Button>
                                                </Link>
                                            )}
                                            {booking.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    leftIcon={<X className="w-4 h-4" />}
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                >
                                                    Lemondás
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Foglalás részletei"
                size="lg"
            >
                {selectedBooking && (
                    <div className="space-y-6">

                        {selectedBooking.packageDetails && (
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <img
                                    src={selectedBooking.packageDetails.coverImage}
                                    alt={selectedBooking.packageDetails.title}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {selectedBooking.packageDetails.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {selectedBooking.packageDetails.destination}, {selectedBooking.packageDetails.country}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(selectedBooking.packageDetails.departureDate)} - {formatDate(selectedBooking.packageDetails.returnDate)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Foglalás státusza</p>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedBooking.status)}
                                    <span className="font-medium">
                                        {getBookingStatusInfo(selectedBooking.status).label}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Fizetés státusza</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium">
                                        {getPaymentStatusInfo(selectedBooking.paymentStatus).label}
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Utazók ({selectedBooking.travelers.length} fő)</h4>
                            <div className="space-y-2">
                                {selectedBooking.travelers.map((traveler, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium text-gray-900">{traveler.name}</p>
                                        <p className="text-sm text-gray-500">{traveler.email}</p>
                                        {traveler.phone && (
                                            <p className="text-sm text-gray-500">{traveler.phone}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Special */}
                        {selectedBooking.specialRequests && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Különleges kérések</h4>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedBooking.specialRequests}
                                </p>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                            <span className="font-medium text-gray-700">Összesen</span>
                            <span className="text-2xl font-bold text-primary-600">
                                {formatCurrency(selectedBooking.totalPrice)}
                            </span>
                        </div>


                        {selectedBooking.status === 'pending' && (
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    leftIcon={<Edit className="w-4 h-4" />}
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        openEditModal(selectedBooking);
                                    }}
                                >
                                    Módosítás
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1"
                                    leftIcon={isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                                    onClick={() => handleCancelBooking(selectedBooking.id)}
                                    disabled={isCancelling}
                                >
                                    Foglalás lemondása
                                </Button>
                            </div>
                        )}
                        {selectedBooking.status === 'confirmed' && (
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    leftIcon={<Edit className="w-4 h-4" />}
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        openEditModal(selectedBooking);
                                    }}
                                >
                                    Adatok módosítása
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit */}
            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingBooking(null);
                    }}
                    onUpdate={handleBookingUpdate}
                />
            )}
        </div>
    );
};

export default MyBookingsPage;
