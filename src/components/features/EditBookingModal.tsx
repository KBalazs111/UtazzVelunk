import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    FileText,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Check,
    Info,
    Wallet,
} from 'lucide-react';
import { Booking, Traveler, TravelPackage } from '../../types';
import { Modal, Button, Input, Card, Badge } from '../../components/ui';
import { bookingService } from '../../services/bookingService';
import { packageService } from '../../services/packageService';
import { formatCurrency } from '../../utils/helpers';

interface EditBookingModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedBooking: Booking) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
    booking,
    isOpen,
    onClose,
    onUpdate,
}) => {
    const [travelers, setTravelers] = useState<Traveler[]>([]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPackage, setIsLoadingPackage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [travelPackage, setTravelPackage] = useState<TravelPackage | null>(null);

    // Adatok betoltese
    useEffect(() => {
        if (isOpen && booking) {
            setTravelers(booking.travelers.map(t => ({ ...t })));
            setSpecialRequests(booking.specialRequests || '');
            setError(null);
            setSuccess(false);
            
            // Csomag adatainak betöltése az árhoz
            loadPackageData();
        }
    }, [isOpen, booking]);

    const loadPackageData = async () => {
        if (!booking.packageId) return;
        
        setIsLoadingPackage(true);
        try {
            const pkg = await packageService.getById(booking.packageId);
            setTravelPackage(pkg);
        } catch (err) {
            console.error('Error loading package:', err);
        } finally {
            setIsLoadingPackage(false);
        }
    };

    const calculateNewPrice = (): number => {
        if (!travelPackage) return booking.totalPrice;
        return travelPackage.price * travelers.length;
    };

    // Arkulonbseg
    const getPriceDifference = (): number => {
        return calculateNewPrice() - booking.totalPrice;
    };

    const handleTravelerChange = (index: number, field: keyof Traveler, value: string) => {
        const newTravelers = [...travelers];
        newTravelers[index] = { ...newTravelers[index], [field]: value };
        setTravelers(newTravelers);
    };

    // uj utas
    const handleAddTraveler = () => {
        if (travelPackage && travelers.length >= travelPackage.maxGroupSize) {
            setError(`Maximum ${travelPackage.maxGroupSize} utas lehet egy foglalásban`);
            return;
        }
        
        setTravelers([
            ...travelers,
            {
                name: '',
                email: '',
                phone: '',
            },
        ]);
        setError(null);
    };

    const handleRemoveTraveler = (index: number) => {
        if (travelers.length <= 1) {
            setError('Legalább egy utasnak kell lennie');
            return;
        }
        setTravelers(travelers.filter((_, i) => i !== index));
        setError(null);
    };


    const validateForm = (): boolean => {
        for (const traveler of travelers) {
            if (!traveler.name.trim()) {
                setError('Minden utasnak meg kell adni a nevét');
                return false;
            }
            if (!traveler.email.trim()) {
                setError('Minden utasnak meg kell adni az email címét');
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(traveler.email)) {
                setError(`Érvénytelen email cím: ${traveler.email}`);
                return false;
            }
        }
        return true;
    };


    const handleSave = async () => {
        setError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const newTotalPrice = calculateNewPrice();
            
            const updatedBooking = await bookingService.update(booking.id, {
                travelers: travelers.map(t => ({
                    name: t.name,
                    email: t.email,
                    phone: t.phone,
                    dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth).toISOString() : undefined,
                    passportNumber: t.passportNumber,
                    specialNeeds: t.specialNeeds,
                })),
                specialRequests,
                totalPrice: newTotalPrice,
            });

            setSuccess(true);
            onUpdate(updatedBooking);


            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error updating booking:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Hiba történt a foglalás módosítása során');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ellenorzes
    const isEditable = ['pending', 'confirmed'].includes(booking.status);
    const priceDiff = getPriceDifference();
    const originalTravelerCount = booking.travelers.length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Foglalás módosítása"
            size="xl"
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Státusz info */}
                {!isEditable && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Ez a foglalás már nem módosítható</p>
                            <p className="text-sm text-amber-600">
                                Csak függőben lévő vagy megerősített foglalások módosíthatók.
                            </p>
                        </div>
                    </div>
                )}

                {/* Info banner */}
                {isEditable && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-800">Mit módosíthatsz?</p>
                            <p className="text-sm text-blue-600">
                                Az utasok adatait, számát és a különleges kéréseket módosíthatod. 
                                Az utazás dátuma és a csomag nem változtatható. Az ár automatikusan frissül az utasok száma alapján.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <Check className="w-5 h-5 text-green-500" />
                        <p className="font-medium text-green-800">A foglalás sikeresen módosítva!</p>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Utasok */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Utazók ({travelers.length} fő)
                        </h3>
                        {isEditable && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={handleAddTraveler}
                            >
                                Utas hozzáadása
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {travelers.map((traveler, index) => (
                            <Card key={index} padding="md" className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="primary">{index + 1}. utas</Badge>
                                    {isEditable && travelers.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:bg-red-50"
                                            onClick={() => handleRemoveTraveler(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Teljes név"
                                        value={traveler.name}
                                        onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                                        placeholder="pl. Kiss János"
                                        disabled={!isEditable}
                                        leftIcon={<User className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        label="Email cím"
                                        type="email"
                                        value={traveler.email}
                                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                                        placeholder="pl. kiss.janos@email.hu"
                                        disabled={!isEditable}
                                        leftIcon={<Mail className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        label="Telefonszám"
                                        value={traveler.phone || ''}
                                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                                        placeholder="pl. +36 30 123 4567"
                                        disabled={!isEditable}
                                        leftIcon={<Phone className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Születési dátum"
                                        type="date"
                                        value={traveler.dateOfBirth ? new Date(traveler.dateOfBirth).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleTravelerChange(index, 'dateOfBirth', e.target.value)}
                                        disabled={!isEditable}
                                        leftIcon={<Calendar className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Útlevél szám"
                                        value={traveler.passportNumber || ''}
                                        onChange={(e) => handleTravelerChange(index, 'passportNumber', e.target.value)}
                                        placeholder="pl. AB123456"
                                        disabled={!isEditable}
                                        leftIcon={<CreditCard className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Speciális igények"
                                        value={traveler.specialNeeds || ''}
                                        onChange={(e) => handleTravelerChange(index, 'specialNeeds', e.target.value)}
                                        placeholder="pl. vegetáriánus étrend"
                                        disabled={!isEditable}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Különleges kérések */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-500" />
                        Különleges kérések
                    </h3>
                    <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        disabled={!isEditable}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                        rows={4}
                        placeholder="Írj ide bármilyen speciális kérést, megjegyzést az utazással kapcsolatban..."
                    />
                </div>

                {/* Ár összesítő */}
                {isEditable && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary-500" />
                            Ár összesítő
                        </h3>
                        
                        {isLoadingPackage ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Ár/fő */}
                                {travelPackage && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ár / fő</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(travelPackage.price)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Utasok száma változás */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Utasok száma</span>
                                    <span className="font-medium text-gray-900">
                                        {travelers.length} fő
                                        {travelers.length !== originalTravelerCount && (
                                            <span className={`ml-2 ${travelers.length > originalTravelerCount ? 'text-green-600' : 'text-red-600'}`}>
                                                ({travelers.length > originalTravelerCount ? '+' : ''}{travelers.length - originalTravelerCount})
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Eredeti ár */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Eredeti összeg</span>
                                    <span className="text-gray-500">{formatCurrency(booking.totalPrice)}</span>
                                </div>

                                {/* Ár különbség  */}
                                {priceDiff !== 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {priceDiff > 0 ? 'Különbözet (fizetendő)' : 'Visszajáró összeg'}
                                        </span>
                                        <span className={`font-medium ${priceDiff > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                            {priceDiff > 0 ? '+' : ''}{formatCurrency(priceDiff)}
                                        </span>
                                    </div>
                                )}

                                {/* Új összeg */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Új összeg</span>
                                    <span className="text-xl font-bold text-primary-600">
                                        {formatCurrency(calculateNewPrice())}
                                    </span>
                                </div>


                                {priceDiff !== 0 && (
                                    <div className={`mt-3 p-3 rounded-lg ${priceDiff > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                                        <p className={`text-sm ${priceDiff > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                            {priceDiff > 0 
                                                ? `💳 A módosítás után ${formatCurrency(priceDiff)} különbözet fizetendő.`
                                                : `✅ A módosítás után ${formatCurrency(Math.abs(priceDiff))} visszajár.`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {isEditable && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                            Mégse
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isLoading || success}
                            leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        >
                            {isLoading ? 'Mentés...' : 'Változtatások mentése'}
                        </Button>
                    </div>
                )}

                {!isEditable && (
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <Button variant="primary" onClick={onClose}>
                            Bezárás
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default EditBookingModal;
