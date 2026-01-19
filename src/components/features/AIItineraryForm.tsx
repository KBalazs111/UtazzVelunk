import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Compass, 
  Sparkles,
  Mountain,
  Utensils,
  Camera,
  Music,
  ShoppingBag,
  Dumbbell,
  Book,
  Waves
} from 'lucide-react';
import { AIItineraryRequest, TravelStyle, GroupType, BudgetLevel } from '../../types';
import { Button, Input, Select, Card } from '../ui';
import { cn } from '../../utils/helpers';

interface AIItineraryFormProps {
  onSubmit: (request: AIItineraryRequest) => void;
  isLoading?: boolean;
}

const AIItineraryForm: React.FC<AIItineraryFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<AIItineraryRequest>({
    destination: '',
    country: '',
    duration: 5,
    travelStyle: 'balanced',
    interests: [],
    groupType: 'couple',
    budget: 'moderate',
  });

  const travelStyles: { value: TravelStyle; label: string; description: string }[] = [
    { value: 'relaxed', label: 'Nyugodt', description: 'Kevesebb program, több pihenés' },
    { value: 'balanced', label: 'Kiegyensúlyozott', description: 'Tökéletes egyensúly' },
    { value: 'adventurous', label: 'Kalandos', description: 'Aktív, sok élmény' },
    { value: 'luxury', label: 'Luxus', description: 'Prémium élmények' },
  ];

  const groupTypes: { value: GroupType; label: string; icon: React.ReactNode }[] = [
    { value: 'solo', label: 'Egyedül', icon: '👤' },
    { value: 'couple', label: 'Páros', icon: '💑' },
    { value: 'family', label: 'Család', icon: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Barátok', icon: '👥' },
    { value: 'business', label: 'Üzleti', icon: '💼' },
  ];

  const budgetLevels: { value: BudgetLevel; label: string; range: string }[] = [
    { value: 'budget', label: 'Gazdaságos', range: '< 100.000 Ft/nap' },
    { value: 'moderate', label: 'Közepes', range: '100-200.000 Ft/nap' },
    { value: 'premium', label: 'Prémium', range: '200-400.000 Ft/nap' },
    { value: 'luxury', label: 'Luxus', range: '400.000+ Ft/nap' },
  ];

  const interests = [
    { id: 'history', label: 'Történelem', icon: Book },
    { id: 'nature', label: 'Természet', icon: Mountain },
    { id: 'food', label: 'Gasztronómia', icon: Utensils },
    { id: 'photography', label: 'Fotózás', icon: Camera },
    { id: 'nightlife', label: 'Éjszakai élet', icon: Music },
    { id: 'shopping', label: 'Vásárlás', icon: ShoppingBag },
    { id: 'adventure', label: 'Kaland', icon: Compass },
    { id: 'wellness', label: 'Wellness', icon: Dumbbell },
    { id: 'beach', label: 'Strand', icon: Waves },
  ];

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.destination && formData.country && formData.interests.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Destination */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />
          Úti cél
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Város / Régió"
            placeholder="pl. Párizs, Toscana, Bali..."
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            leftIcon={<MapPin className="w-5 h-5" />}
            required
          />
          <Input
            label="Ország"
            placeholder="pl. Franciaország"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            required
          />
        </div>
      </Card>

      {/* Duration */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          Utazás időtartama
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="2"
            max="9"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="w-24 text-center">
            <span className="text-2xl font-bold text-primary-600">{formData.duration}</span>
            <span className="text-gray-500 ml-1">nap</span>
          </div>
        </div>
      </Card>

      {/* Travel Style */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary-500" />
          Utazási stílus
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {travelStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.value }))}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                formData.travelStyle === style.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-semibold text-gray-900">{style.label}</p>
              <p className="text-sm text-gray-500 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Group Type */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          Csoport típusa
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {groupTypes.map((group) => (
            <button
              key={group.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, groupType: group.value }))}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                formData.groupType === group.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <span className="text-2xl">{group.icon}</span>
              <p className="font-medium text-gray-900 mt-2">{group.label}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Budget */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary-500" />
          Költségkeret
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {budgetLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, budget: level.value }))}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                formData.budget === level.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-semibold text-gray-900">{level.label}</p>
              <p className="text-sm text-gray-500 mt-1">{level.range}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Interests */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Érdeklődési körök
          <span className="text-sm font-normal text-gray-500">(válassz legalább egyet)</span>
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {interests.map((interest) => {
            const Icon = interest.icon;
            const isSelected = formData.interests.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 mx-auto',
                  isSelected ? 'text-primary-500' : 'text-gray-400'
                )} />
                <p className={cn(
                  'font-medium mt-2 text-sm',
                  isSelected ? 'text-primary-600' : 'text-gray-600'
                )}>
                  {interest.label}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Special Requirements */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Egyéb kívánságok (opcionális)
        </h3>
        <textarea
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 resize-none"
          rows={3}
          placeholder="pl. gluténmentes étkezés, kerekesszék-barát helyszínek, konkrét látnivalók..."
          value={formData.specialRequirements || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
        />
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        leftIcon={<Sparkles className="w-5 h-5" />}
        disabled={!formData.destination || !formData.country || formData.interests.length === 0}
      >
        Útiterv generálása
      </Button>
    </form>
  );
};

export default AIItineraryForm;
