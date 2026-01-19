const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

interface UnsplashPhoto {
    id: string;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    alt_description: string;
    user: {
        name: string;
        links: {
            html: string;
        };
    };
}

export const imageService = {

    async searchPhotos(query: string, count: number = 5): Promise<UnsplashPhoto[]> {
        try {
            const response = await fetch(
                `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
                {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Image search error:', error);
            return [];
        }
    },


    async getDestinationImages(destination: string, country: string): Promise<string[]> {
        const photos = await this.searchPhotos(`${destination} ${country} travel`, 6);
        return photos.map(photo => photo.urls.regular);
    },


    async getRandomPhoto(query: string): Promise<string | null> {
        try {
            const response = await fetch(
                `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
                {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                }
            );

            if (!response.ok) return null;

            const photo: UnsplashPhoto = await response.json();
            return photo.urls.regular;
        } catch (error) {
            console.error('Random photo error:', error);
            return null;
        }
    },


    async getItineraryImages(destination: string, activities: string[]): Promise<Map<string, string>> {
        const imageMap = new Map<string, string>();

        const mainPhotos = await this.searchPhotos(`${destination} landmark`, 1);
        if (mainPhotos.length > 0) {
            imageMap.set('main', mainPhotos[0].urls.regular);
        }

        const activityPromises = activities.slice(0, 5).map(async (activity) => {
            const photos = await this.searchPhotos(`${activity} ${destination}`, 1);
            if (photos.length > 0) {
                return { activity, url: photos[0].urls.regular };
            }
            return null;
        });

        const results = await Promise.all(activityPromises);
        results.forEach(result => {
            if (result) {
                imageMap.set(result.activity, result.url);
            }
        });

        return imageMap;
    },
};