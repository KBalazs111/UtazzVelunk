import { Models } from 'appwrite';
import { databases, ID, Query, DATABASE_ID } from './appwrite';
import { TravelPackage, TravelFilters } from '../types';

const PACKAGES_COLLECTION = 'packages';


interface PackageDocument extends Models.Document {
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    destination: string;
    country: string;
    continent: string;
    price: number;
    originalPrice?: number;
    currency?: string;
    duration: number;
    maxGroupSize: number;
    difficulty: string;
    category: string;
    coverImage: string;
    images: string[];
    included: string[];
    notIncluded: string[];
    highlights: string[];
    itinerary: string;
    departureDate: string;
    returnDate: string;
    rating: number;
    reviewCount: number;
    availableSpots: number;
    isActive: boolean;
    isFeatured: boolean;
}

export const packageService = {

    async getAll(filters?: TravelFilters): Promise<TravelPackage[]> {
        try {
            const queries: string[] = [];


            if (filters?.category) {
                queries.push(Query.equal('category', filters.category));
            }
            if (filters?.continent) {
                queries.push(Query.equal('continent', filters.continent));
            }
            if (filters?.minPrice) {
                queries.push(Query.greaterThanEqual('price', filters.minPrice));
            }
            if (filters?.maxPrice) {
                queries.push(Query.lessThanEqual('price', filters.maxPrice));
            }
            if (filters?.duration?.min) {
                queries.push(Query.greaterThanEqual('duration', filters.duration.min));
            }
            if (filters?.duration?.max) {
                queries.push(Query.lessThanEqual('duration', filters.duration.max));
            }
            if (filters?.difficulty) {
                queries.push(Query.equal('difficulty', filters.difficulty));
            }
            if (filters?.search) {
                queries.push(Query.search('title', filters.search));
            }

            if (filters?.sortBy) {
                const order = filters.sortOrder === 'desc' ? Query.orderDesc : Query.orderAsc;
                queries.push(order(filters.sortBy));
            } else {
                queries.push(Query.orderDesc('$createdAt'));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                queries
            );

            return response.documents.map(doc => this.mapDocumentToPackage(doc));
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw error;
        }
    },


    async getById(packageId: string): Promise<TravelPackage | null> {
        try {
            const doc = await databases.getDocument(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                packageId
            );

            return this.mapDocumentToPackage(doc);
        } catch (error) {
            console.error('Error fetching package:', error);
            return null;
        }
    },


    async getBySlug(slug: string): Promise<TravelPackage | null> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                [Query.equal('slug', slug), Query.limit(1)]
            );

            if (response.documents.length === 0) {
                return null;
            }

            return this.mapDocumentToPackage(response.documents[0]);
        } catch (error) {
            console.error('Error fetching package by slug:', error);
            return null;
        }
    },


    async getFeatured(limit: number = 6): Promise<TravelPackage[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                [
                    Query.equal('isActive', true),
                    Query.equal('isFeatured', true),
                    Query.limit(limit),
                ]
            );

            return response.documents.map(doc => this.mapDocumentToPackage(doc));
        } catch (error) {
            console.error('Error fetching featured packages:', error);
            throw error;
        }
    },


    async create(data: Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<TravelPackage> {
        try {
            const slug = this.generateSlug(data.title);

            const doc = await databases.createDocument(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                ID.unique(),
                {
                    ...data,
                    slug,
                    rating: 0,
                    reviewCount: 0,
                    images: data.images,
                    included: data.included,
                    notIncluded: data.notIncluded,
                    highlights: data.highlights,
                    itinerary: JSON.stringify(data.itinerary),
                    difficulty: data.difficulty,
                    currency: data.currency || 'HUF',
                    departureDate: data.departureDate.toISOString(),
                    returnDate: data.returnDate.toISOString(),
                }
            );

            return this.mapDocumentToPackage(doc);
        } catch (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    },

    async update(packageId: string, data: Partial<TravelPackage>): Promise<TravelPackage> {
        try {
            const updateData: Record<string, unknown> = { ...data };


            if (data.images) updateData.images = data.images;
            if (data.included) updateData.included = data.included;
            if (data.notIncluded) updateData.notIncluded = data.notIncluded;
            if (data.highlights) updateData.highlights = data.highlights;

            if (data.itinerary) updateData.itinerary = JSON.stringify(data.itinerary);
            if (data.departureDate) updateData.departureDate = data.departureDate.toISOString();
            if (data.returnDate) updateData.returnDate = data.returnDate.toISOString();

            if (data.title) {
                updateData.slug = this.generateSlug(data.title);
            }

            const doc = await databases.updateDocument(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                packageId,
                updateData
            );

            return this.mapDocumentToPackage(doc);
        } catch (error) {
            console.error('Error updating package:', error);
            throw error;
        }
    },


    async delete(packageId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                PACKAGES_COLLECTION,
                packageId
            );
        } catch (error) {
            console.error('Error deleting package:', error);
            throw error;
        }
    },


    async toggleActive(packageId: string, isActive: boolean): Promise<TravelPackage> {
        return this.update(packageId, { isActive });
    },

    async toggleFeatured(packageId: string, isFeatured: boolean): Promise<TravelPackage> {
        return this.update(packageId, { isFeatured });
    },


    async decreaseAvailableSpots(packageId: string, count: number = 1): Promise<TravelPackage> {
        try {
            const pkg = await this.getById(packageId);
            if (!pkg) throw new Error('Package not found');

            const newSpots = Math.max(0, pkg.availableSpots - count);
            return this.update(packageId, { availableSpots: newSpots });
        } catch (error) {
            console.error('Error decreasing spots:', error);
            throw error;
        }
    },


    async increaseAvailableSpots(packageId: string, count: number = 1): Promise<TravelPackage> {
        try {
            const pkg = await this.getById(packageId);
            if (!pkg) throw new Error('Package not found');

            const newSpots = Math.min(pkg.maxGroupSize, pkg.availableSpots + count);
            return this.update(packageId, { availableSpots: newSpots });
        } catch (error) {
            console.error('Error increasing spots:', error);
            throw error;
        }
    },

    generateSlug(title: string): string {
        return title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            + '-' + ID.unique().substring(0, 6);
    },


    mapDocumentToPackage(doc: Models.Document): TravelPackage {
        const data = doc as unknown as PackageDocument;


        const safeParse = <T>(input: string | unknown, fallback: T): T => {
            try {
                if (Array.isArray(input)) {
                    return input as unknown as T;
                }
                if (typeof input === 'string') {

                    if (!input) return fallback;
                    return JSON.parse(input);
                }
                return fallback;
            } catch (e) {
                console.warn(`JSON parse error for document ${doc.$id}`, e);
                return fallback;
            }
        };

        return {
            id: doc.$id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            destination: data.destination,
            country: data.country,
            continent: data.continent,
            price: data.price,
            originalPrice: data.originalPrice,
            currency: data.currency || 'HUF',
            duration: data.duration,
            maxGroupSize: data.maxGroupSize,
            difficulty: (data.difficulty as TravelPackage['difficulty']) || 'moderate',
            category: data.category as TravelPackage['category'],
            coverImage: data.coverImage,


            images: Array.isArray(data.images) ? data.images : safeParse(data.images, []),
            included: Array.isArray(data.included) ? data.included : safeParse(data.included, []),
            notIncluded: Array.isArray(data.notIncluded) ? data.notIncluded : safeParse(data.notIncluded, []),
            highlights: Array.isArray(data.highlights) ? data.highlights : safeParse(data.highlights, []),

            itinerary: safeParse(data.itinerary, []),

            departureDate: new Date(data.departureDate),
            returnDate: new Date(data.returnDate),
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            availableSpots: data.availableSpots,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
            createdAt: new Date(doc.$createdAt),
            updatedAt: new Date(doc.$updatedAt),
        };
    },
};