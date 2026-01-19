import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, Clock, Loader2 } from 'lucide-react';
import { BookingStatus, Booking } from '../../types';
import { Button, Input, Card, Badge, Modal, Select } from '../../components/ui';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

import { bookingService } from '../../services/bookingService';
import { packageService } from '../../services/packageService';
import {DATABASE_ID, databases} from '../../services/appwrite';
import { formatCurrency, formatDate, getBookingStatusInfo, getPaymentStatusInfo, cn } from '../../utils/helpers';

interface BookingWithDetails extends Booking {
    packageTitle?: string;
    userName?: string;
    userEmail?: string;
    travelerCount?: number;
}

const AdminBookings: React.FC = () => {
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingService.getAll();

            const detailed = await Promise.all(response.bookings.map(async (booking) => {
                let packageTitle = 'Törölt csomag';
                let userName = 'Ismeretlen';
                let userEmail = '';

                try {
                    if (booking.packageId) {
                        const pkg = await packageService.getById(booking.packageId);
                        if (pkg) packageTitle = pkg.title;
                    }
                    if (booking.userId) {
                        const user = await databases.getDocument(DATABASE_ID, 'users', booking.userId);
                        userName = user.name;
                        userEmail = user.email;
                    }
                } catch (e) {
                    console.warn('Részletek betöltése sikertelen:', e);
                }

                return {
                    ...booking,
                    packageTitle,
                    userName,
                    userEmail,
                    travelerCount: booking.travelers.length
                };
            }));

            setBookings(detailed);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.packageTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.includes(searchTerm);

        const matchesStatus = !statusFilter || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
        try {
            await bookingService.updateStatus(bookingId, newStatus);
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));
            if (selectedBooking?.id === bookingId) {
                setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Status update failed:', error);
            alert('Nem sikerült frissíteni a státuszt.');
        }
    };

    const handleViewDetails = (booking: BookingWithDetails) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const statusOptions = [
        { value: '', label: 'Összes státusz' },
        { value: 'pending', label: 'Függőben' },
        { value: 'confirmed', label: 'Megerősítve' },
        { value: 'cancelled', label: 'Lemondva' },
        { value: 'completed', label: 'Teljesítve' },
    ];


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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Foglalások kezelése</h1>
                    <p className="text-gray-500 mt-1">{bookings.length} foglalás összesen</p>
                </div>
            </div>

            <Card padding="md">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Keresés név, utazás vagy azonosító alapján..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <Select
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value as BookingStatus | '')}
                        className="w-48"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { status: 'pending', icon: Clock, color: 'amber' },
                    { status: 'confirmed', icon: Check, color: 'green' },
                    { status: 'cancelled', icon: X, color: 'red' },
                    { status: 'completed', icon: Check, color: 'blue' },
                ].map(({ status, icon: Icon, color }) => {
                    const count = bookings.filter(b => b.status === status).length;
                    const info = getBookingStatusInfo(status as BookingStatus);
                    return (
                        <Card key={status} padding="md" className={cn(
                            'cursor-pointer transition-all',
                            statusFilter === status && `ring-2 ring-${color}-500`
                        )} onClick={() => setStatusFilter(statusFilter === status ? '' : status as BookingStatus)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${color}-600`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <p className="text-sm text-gray-500">{info.label}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Azonosító</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Ügyfél</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Utazás</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Összeg</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Státusz</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fizetés</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Dátum</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Műveletek</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => {
                            const statusInfo = getBookingStatusInfo(booking.status);
                            const paymentInfo = getPaymentStatusInfo(booking.paymentStatus);
                            return (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-600">#{booking.id.substring(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.userName}</p>
                                            <p className="text-sm text-gray-500">{booking.userEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 max-w-xs truncate">
                                            {booking.packageTitle}
                                        </p>
                                        <p className="text-sm text-gray-500">{booking.travelerCount} utas</p>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(booking.totalPrice)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">

                                        <Badge variant={getBadgeVariant(statusInfo.color)}>
                                            {statusInfo.label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">

                                        <Badge variant={getBadgeVariant(paymentInfo.color)}>
                                            {paymentInfo.label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(booking.bookedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Részletek"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Megerősítés"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Elutasítás"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nincs találat a keresési feltételeknek megfelelően.</p>
                    </div>
                )}
            </Card>

            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Foglalás #${selectedBooking?.id}`}
                size="lg"
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Ügyfél adatai</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Név:</span>
                                    <span className="ml-2 text-gray-900">{selectedBooking.userName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Email:</span>
                                    <span className="ml-2 text-gray-900">{selectedBooking.userEmail}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Utasok ({selectedBooking.travelers.length} fő)</h4>
                            <div className="space-y-2">
                                {selectedBooking.travelers.map((traveler, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                                        <span className="font-medium text-gray-900">{traveler.name}</span>
                                        <span className="text-gray-500 ml-2">{traveler.email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Státusz</h4>
                                <Badge variant={getBadgeVariant(getBookingStatusInfo(selectedBooking.status).color)}>
                                    {getBookingStatusInfo(selectedBooking.status).label}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Fizetés</h4>
                                <Badge variant={getBadgeVariant(getPaymentStatusInfo(selectedBooking.paymentStatus).color)}>
                                    {getPaymentStatusInfo(selectedBooking.paymentStatus).label}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 bg-primary-50 rounded-xl flex items-center justify-between">
                            <span className="text-gray-700">Teljes összeg:</span>
                            <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(selectedBooking.totalPrice)}
              </span>
                        </div>

                        {selectedBooking.status === 'pending' && (
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => {
                                        updateBookingStatus(selectedBooking.id, 'cancelled');
                                        setShowDetailModal(false);
                                    }}
                                >
                                    Elutasítás
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => {
                                        updateBookingStatus(selectedBooking.id, 'confirmed');
                                        setShowDetailModal(false);
                                    }}
                                >
                                    Megerősítés
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminBookings;