import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Package,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Eye,
    Loader2
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { bookingService } from '../../services/bookingService';
import { packageService } from '../../services/packageService';
import {DATABASE_ID, databases} from '../../services/appwrite';
import { Booking, TravelPackage } from '../../types';
import { formatCurrency, formatShortDate, getBookingStatusInfo } from '../../utils/helpers';

interface BookingWithDetails extends Booking {
    packageName?: string;
    userName?: string;
}


type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

const AdminDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        totalUsers: 0,
        activePackages: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0
    });

    const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>([]);
    const [popularPackages, setPopularPackages] = useState<TravelPackage[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setIsLoading(true);

                const [bookingStats, packages, usersList] = await Promise.all([
                    bookingService.getStats(),
                    packageService.getAll(),
                    databases.listDocuments(DATABASE_ID, 'users', [])
                ]);

                const recentResponse = await bookingService.getAll({ limit: 5 });

                const detailedBookings = await Promise.all(recentResponse.bookings.map(async (booking) => {
                    let packageName = 'Törölt csomag';
                    let userName = 'Ismeretlen felhasználó';

                    try {
                        if (booking.packageId) {
                            const pkg = await packageService.getById(booking.packageId);
                            if (pkg) packageName = pkg.title;
                        }

                        if (booking.userId) {
                            const userDoc = await databases.getDocument(DATABASE_ID, 'users', booking.userId);
                            userName = userDoc.name;
                        }
                    } catch (e) {
                        console.warn('Hiba a részletek betöltésekor:', e);
                    }

                    return { ...booking, packageName, userName };
                }));

                const featured = await packageService.getFeatured(4);

                setStats({
                    totalUsers: usersList.total,
                    activePackages: packages.filter(p => p.isActive).length,
                    totalBookings: bookingStats.total,
                    totalRevenue: bookingStats.totalRevenue,
                    pendingBookings: bookingStats.pending
                });

                setRecentBookings(detailedBookings);
                setPopularPackages(featured);

            } catch (error) {
                console.error('Dashboard data load failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);


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

    const statCards = [
        {
            label: 'Összes felhasználó',
            value: stats.totalUsers,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Aktív utazások',
            value: stats.activePackages,
            change: '+3',
            trend: 'up',
            icon: Package,
            color: 'bg-green-500',
        },
        {
            label: 'Összes foglalás',
            value: stats.totalBookings,
            change: '+8%',
            trend: 'up',
            icon: Calendar,
            color: 'bg-purple-500',
        },
        {
            label: 'Bevétel',
            value: formatCurrency(stats.totalRevenue),
            change: '+23%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-primary-500',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} padding="lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {stat.trend === 'up' ? (
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                            )}
                            <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {stat.change}
              </span>
                            <span className="text-gray-400 text-sm">vs előző hónap</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <Card padding="none">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Legutóbbi foglalások</h3>
                            <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Összes megtekintése
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => {
                                const statusInfo = getBookingStatusInfo(booking.status);
                                return (
                                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {booking.userName}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {booking.packageName}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <Badge variant={getBadgeVariant(statusInfo.color)}>
                                                    {statusInfo.label}
                                                </Badge>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatShortDate(booking.bookedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-500">Még nincs foglalás a rendszerben.</div>
                        )}
                    </div>
                </Card>


                <div className="space-y-6">

                    {stats.pendingBookings > 0 && (
                        <Card padding="lg" className="bg-amber-50 border border-amber-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-amber-800">
                                        {stats.pendingBookings} függőben lévő foglalás
                                    </p>
                                    <p className="text-sm text-amber-600">
                                        Várakozik a megerősítésre
                                    </p>
                                </div>
                                <Link
                                    to="/admin/bookings?status=pending"
                                    className="text-amber-700 hover:text-amber-800 font-medium text-sm"
                                >
                                    Megtekintés →
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* kiemelt */}
                    <Card padding="none">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Kiemelt utazások</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {popularPackages.map((pkg) => (
                                <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={pkg.coverImage}
                                            alt={pkg.title}
                                            className="w-16 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{pkg.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {pkg.destination}, {pkg.country}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(pkg.price)}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Eye className="w-4 h-4" />
                                                {pkg.reviewCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gyors statisztikák</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Átlagos foglalási érték</span>
                                <span className="font-semibold text-gray-900">
                  {stats.totalBookings > 0
                      ? formatCurrency(stats.totalRevenue / stats.totalBookings)
                      : '0 Ft'
                  }
                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Konverziós arány</span>
                                <span className="font-semibold text-green-600">4.2%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Átlagos értékelés</span>
                                <span className="font-semibold text-gray-900">4.85 ⭐</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;