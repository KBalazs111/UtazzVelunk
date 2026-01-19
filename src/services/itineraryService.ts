import { Models } from 'appwrite';
import { databases, ID, Query, DATABASE_ID } from './appwrite';
import { AIItinerary, AIItineraryRequest } from '../types';

const ITINERARIES_COLLECTION = 'itineraries';

interface ItineraryDocument extends Models.Document {
    userId: string;
    title: string;
    summary: string;
    destination: string;
    country: string;
    duration: number;
    requestData: string;
    daysData: string;
    estimatedBudget: string;
    tips: string[];
    bestTimeToVisit: string;
    isSaved: boolean;
    coverImage?: string;
}

export const itineraryService = {

    async save(userId: string, itinerary: AIItinerary): Promise<AIItinerary> {
        try {
            const doc = await databases.createDocument(
                DATABASE_ID,
                ITINERARIES_COLLECTION,
                ID.unique(),
                {
                    userId,
                    title: itinerary.title,
                    summary: itinerary.summary,
                    destination: itinerary.request.destination,
                    country: itinerary.request.country,
                    duration: itinerary.request.duration,
                    requestData: JSON.stringify(itinerary.request),
                    daysData: JSON.stringify(itinerary.days),
                    estimatedBudget: JSON.stringify(itinerary.estimatedBudget),
                    tips: itinerary.tips,
                    bestTimeToVisit: itinerary.bestTimeToVisit,
                    isSaved: true,
                    coverImage: itinerary.days[0]?.image || '',
                }
            );

            return this.mapDocumentToItinerary(doc);
        } catch (error) {
            console.error('Error saving itinerary:', error);
            throw error;
        }
    },


    async getByUserId(userId: string): Promise<AIItinerary[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                ITINERARIES_COLLECTION,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                ]
            );

            return response.documents.map(doc => this.mapDocumentToItinerary(doc));
        } catch (error) {
            console.error('Error fetching user itineraries:', error);
            throw error;
        }
    },


    async getById(itineraryId: string): Promise<AIItinerary | null> {
        try {
            const doc = await databases.getDocument(
                DATABASE_ID,
                ITINERARIES_COLLECTION,
                itineraryId
            );

            return this.mapDocumentToItinerary(doc);
        } catch (error) {
            console.error('Error fetching itinerary:', error);
            return null;
        }
    },


    async update(itineraryId: string, data: Partial<AIItinerary>): Promise<AIItinerary> {
        try {
            const updateData: Record<string, unknown> = {};

            if (data.title) updateData.title = data.title;
            if (data.summary) updateData.summary = data.summary;
            if (data.days) updateData.daysData = JSON.stringify(data.days);
            if (data.tips) updateData.tips = data.tips;
            if (data.bestTimeToVisit) updateData.bestTimeToVisit = data.bestTimeToVisit;
            if (data.estimatedBudget) updateData.estimatedBudget = JSON.stringify(data.estimatedBudget);

            const doc = await databases.updateDocument(
                DATABASE_ID,
                ITINERARIES_COLLECTION,
                itineraryId,
                updateData
            );

            return this.mapDocumentToItinerary(doc);
        } catch (error) {
            console.error('Error updating itinerary:', error);
            throw error;
        }
    },


    async delete(itineraryId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                ITINERARIES_COLLECTION,
                itineraryId
            );
        } catch (error) {
            console.error('Error deleting itinerary:', error);
            throw error;
        }
    },


    generateShareLink(itineraryId: string): string {
        return `${window.location.origin}/itinerary/${itineraryId}`;
    },


    mapDocumentToItinerary(doc: Models.Document): AIItinerary {
        const data = doc as unknown as ItineraryDocument;

        const safeParse = <T>(input: string, fallback: T): T => {
            try {
                if (!input) return fallback;
                return JSON.parse(input);
            } catch {
                return fallback;
            }
        };

        const request: AIItineraryRequest = safeParse(data.requestData, {
            destination: data.destination,
            country: data.country,
            duration: data.duration,
            travelStyle: 'balanced',
            interests: [],
            groupType: 'couple',
            budget: 'moderate',
        });

        return {
            id: doc.$id,
            userId: data.userId,
            request,
            title: data.title,
            summary: data.summary,
            days: safeParse(data.daysData, []),
            estimatedBudget: safeParse(data.estimatedBudget, { min: 0, max: 0, currency: 'HUF' }),
            tips: Array.isArray(data.tips) ? data.tips : [],
            bestTimeToVisit: data.bestTimeToVisit,
            createdAt: new Date(doc.$createdAt),
            updatedAt: new Date(doc.$updatedAt),
            isSaved: data.isSaved,
        };
    },
};
