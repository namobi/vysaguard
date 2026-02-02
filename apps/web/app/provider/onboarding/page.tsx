"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { checkProviderStatus } from '@/lib/providerUtils';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Country {
  id: string;
  name: string;
}

interface VisaType {
  id: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
}

interface ProviderType {
  id: string;
  name: string;
}

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  // Multi-select options
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>([]);

  // Selected values
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedVisaTypes, setSelectedVisaTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setFetchingData(true);

      // Check if provider profile is already complete
      const { isProvider, isComplete } = await checkProviderStatus();
      if (isProvider && isComplete) {
        // Already completed onboarding, redirect to dashboard
        router.push('/provider/dashboard');
        return;
      }

      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setContactEmail(user.email);
      }

      // Fetch countries
      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');

      // Fetch visa types
      const { data: visaTypesData } = await supabase
        .from('visa_types')
        .select('id, name')
        .order('name');

      // Fetch languages
      const { data: languagesData } = await supabase
        .from('languages')
        .select('id, name')
        .order('name');

      // Fetch provider types
      const { data: providerTypesData } = await supabase
        .from('provider_types')
        .select('id, name')
        .order('name');

      setCountries(countriesData || []);
      setVisaTypes(visaTypesData || []);
      setLanguages(languagesData || []);
      setProviderTypes(providerTypesData || []);

      setFetchingData(false);
    } catch (error) {
      console.error('Error fetching form data:', error);
      setFetchingData(false);
    }
  };

  const handleMultiSelectChange = (
    value: string,
    selectedValues: string[],
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!businessName.trim()) {
      alert('Business name is required');
      return;
    }
    if (!contactEmail.trim()) {
      alert('Contact email is required');
      return;
    }
    if (!contactPhone.trim()) {
      alert('Contact phone is required');
      return;
    }
    if (selectedCountries.length === 0) {
      alert('Please select at least one country served');
      return;
    }
    if (selectedVisaTypes.length === 0) {
      alert('Please select at least one visa type served');
      return;
    }
    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      alert('Years of experience is required');
      return;
    }
    if (selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return;
    }
    if (selectedProviderTypes.length === 0) {
      alert('Please select at least one provider type');
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Not authenticated');
        router.push('/login');
        return;
      }

      // Update profile to mark user as provider
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          is_provider: true
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        alert('Failed to update profile: ' + profileError.message);
        setLoading(false);
        return;
      }

      // Upsert provider data
      const { data, error } = await supabase
        .from('providers')
        .upsert({
          user_id: user.id,
          business_name: businessName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          bio: bio || null,
          website_url: website || null,
          logo_url: logoUrl || null,
          years_experience: parseInt(yearsExperience),
          countries_served: selectedCountries,
          visa_types_served: selectedVisaTypes,
          languages_spoken: selectedLanguages,
          provider_types: selectedProviderTypes,
          status: 'pending',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('Error saving provider:', error);
        alert('Failed to save provider data: ' + error.message);
        setLoading(false);
        return;
      }

      console.log('Provider saved successfully:', data);

      // Redirect to provider dashboard
      router.push('/provider/dashboard');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('An error occurred: ' + error.message);
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-md">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">VysaGuard</span>
          </div>
          <p className="text-sm text-slate-600">Provider Onboarding</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Provider Profile</h1>
          <p className="text-slate-600">
            Provide your business information to get verified and start receiving client requests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Company or Agency Name"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your business and experience..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Countries Served */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Countries Served <span className="text-red-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 max-h-48 overflow-y-auto">
              {countries.map(country => (
                <label key={country.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.id)}
                    onChange={() => handleMultiSelectChange(country.id, selectedCountries, setSelectedCountries)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{country.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Visa Types Served */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Visa Types Served <span className="text-red-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 max-h-48 overflow-y-auto">
              {visaTypes.map(visaType => (
                <label key={visaType.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVisaTypes.includes(visaType.id)}
                    onChange={() => handleMultiSelectChange(visaType.id, selectedVisaTypes, setSelectedVisaTypes)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{visaType.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Languages <span className="text-red-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 max-h-48 overflow-y-auto">
              {languages.map(language => (
                <label key={language.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(language.id)}
                    onChange={() => handleMultiSelectChange(language.id, selectedLanguages, setSelectedLanguages)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{language.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Provider Types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Provider Type <span className="text-red-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-4">
              {providerTypes.map(type => (
                <label key={type.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProviderTypes.includes(type.id)}
                    onChange={() => handleMultiSelectChange(type.id, selectedProviderTypes, setSelectedProviderTypes)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
