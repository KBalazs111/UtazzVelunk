import { Models } from 'appwrite';
import { databases, ID, Query } from './appwrite';
import { Booking, BookingStatus, PaymentStatus } from '../types';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const BOOKINGS_COLLECTION = 'bookings';

export interface CreateBookingData {
    userId: string;
    packageId: string;
    travelers: {
        name: string;
        email: string;
        phone?: string;
        dateOfBirth?: string;
        passportNumber?: string;
    }[];
    totalPrice: number;
    specialRequests?: string;
    currency?: string;
}


interface BookingDocument extends Models.Document {
    userId: string;
    packageId: string;
    travelers: string;
    totalPrice: number;
    specialRequests?: string;
    status: string;
    paymentStatus: string;

}

export const bookingService = {

    async create(data: CreateBookingData): Promise<Booking> {
        try {
            const booking = await databases.createDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                ID.unique(),
                {
                    userId: data.userId,
                    packageId: data.packageId,
                    travelers: JSON.stringify(data.travelers),
                    totalPrice: data.totalPrice,
                    specialRequests: data.specialRequests || '',
                    status: 'pending',
                    paymentStatus: 'pending',

                }
            );

            return this.mapDocumentToBooking(booking);
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },


    async getById(bookingId: string): Promise<Booking | null> {
        try {
            const booking = await databases.getDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId
            );

            return this.mapDocumentToBooking(booking);
        } catch (error) {
            console.error('Error fetching booking:', error);
            return null;
        }
    },

    // Felhasználó foglalása
    async getByUserId(userId: string): Promise<Booking[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                ]
            );

            return response.documents.map(doc => this.mapDocumentToBooking(doc));
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error;
        }
    },

    // Összes foglalás
    async getAll(filters?: {
        status?: BookingStatus;
        paymentStatus?: PaymentStatus;
        limit?: number;
        offset?: number;
    }): Promise<{ bookings: Booking[]; total: number }> {
        try {
            const queries: string[] = [Query.orderDesc('$createdAt')];

            if (filters?.status) queries.push(Query.equal('status', filters.status));
            if (filters?.paymentStatus) queries.push(Query.equal('paymentStatus', filters.paymentStatus));
            if (filters?.limit) queries.push(Query.limit(filters.limit));
            if (filters?.offset) queries.push(Query.offset(filters.offset));

            const response = await databases.listDocuments(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                queries
            );

            return {
                bookings: response.documents.map(doc => this.mapDocumentToBooking(doc)),
                total: response.total,
            };
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            throw error;
        }
    },


    async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
        try {
            const updated = await databases.updateDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId,
                {
                    status,

                }
            );

            return this.mapDocumentToBooking(updated);
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },


    async updatePaymentStatus(bookingId: string, paymentStatus: PaymentStatus): Promise<Booking> {
        try {
            const updates: Record<string, unknown> = {
                paymentStatus,
            };

            if (paymentStatus === 'paid') {
                updates.status = 'confirmed';
            }

            const updated = await databases.updateDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId,
                updates
            );

            return this.mapDocumentToBooking(updated);
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },


    async cancel(bookingId: string): Promise<Booking> {
        try {
            const updated = await databases.updateDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId,
                {
                    status: 'cancelled',
                }
            );

            return this.mapDocumentToBooking(updated);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },


    async update(bookingId: string, data: {
        travelers?: {
            name: string;
            email: string;
            phone?: string;
            dateOfBirth?: string;
            passportNumber?: string;
            specialNeeds?: string;
        }[];
        specialRequests?: string;
        totalPrice?: number;
    }): Promise<Booking> {
        try {

            const currentBooking = await this.getById(bookingId);
            if (!currentBooking) {
                throw new Error('Foglalás nem található');
            }


            if (!['pending', 'confirmed'].includes(currentBooking.status)) {
                throw new Error('Ez a foglalás már nem módosítható');
            }

            const updateData: Record<string, unknown> = {};

            if (data.travelers) {
                updateData.travelers = JSON.stringify(data.travelers);
            }
            if (data.specialRequests !== undefined) {
                updateData.specialRequests = data.specialRequests;
            }
            if (data.totalPrice !== undefined) {
                updateData.totalPrice = data.totalPrice;
            }

            const updated = await databases.updateDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId,
                updateData
            );

            return this.mapDocumentToBooking(updated);
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },


    async delete(bookingId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                bookingId
            );
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },


    async getStats(): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        cancelled: number;
        completed: number;
        totalRevenue: number;
    }> {
        try {

            const [all, pending, confirmed, cancelled, completed] = await Promise.all([
                databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [Query.limit(0)]),
                databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [Query.equal('status', 'pending'), Query.limit(0)]),
                databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [Query.equal('status', 'confirmed'), Query.limit(0)]),
                databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [Query.equal('status', 'cancelled'), Query.limit(0)]),
                databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [Query.equal('status', 'completed'), Query.limit(0)]),
            ]);


            const paidBookings = await databases.listDocuments(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                [Query.equal('paymentStatus', 'paid'), Query.limit(1000)]
            );

            const totalRevenue = paidBookings.documents.reduce(
                (sum, doc) => sum + (doc.totalPrice as number || 0),
                0
            );

            return {
                total: all.total,
                pending: pending.total,
                confirmed: confirmed.total,
                cancelled: cancelled.total,
                completed: completed.total,
                totalRevenue,
            };
        } catch (error) {
            console.error('Error fetching booking stats:', error);
            throw error;
        }
    },


    async getByPackageId(packageId: string): Promise<Booking[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BOOKINGS_COLLECTION,
                [
                    Query.equal('packageId', packageId),
                    Query.orderDesc('$createdAt'),
                ]
            );

            return response.documents.map(doc => this.mapDocumentToBooking(doc));
        } catch (error) {
            console.error('Error fetching package bookings:', error);
            throw error;
        }
    },


    mapDocumentToBooking(doc: Models.Document): Booking {

        const data = doc as unknown as BookingDocument;

        let travelers = [];


        try {
            if (typeof data.travelers === 'string') {
                travelers = JSON.parse(data.travelers);
            } else if (Array.isArray(data.travelers)) {
                travelers = data.travelers;
            }
        } catch (e) {
            console.error('Failed to parse travelers JSON for booking:', doc.$id, e);
            travelers = [];
        }

        return {
            id: doc.$id,
            userId: data.userId,
            packageId: data.packageId,
            status: data.status as BookingStatus,
            travelers: travelers,
            totalPrice: data.totalPrice,
            currency: 'HUF',
            specialRequests: data.specialRequests,
            paymentStatus: data.paymentStatus as PaymentStatus,
            bookedAt: new Date(doc.$createdAt),
            updatedAt: new Date(doc.$updatedAt),
        };
    },
};