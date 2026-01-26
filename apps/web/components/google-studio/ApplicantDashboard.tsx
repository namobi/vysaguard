"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingBag,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Compass,
  Map,
  FileCheck,
  UserCheck,
  Search,
  Check,
  MoreVertical,
  ChevronRight,
  Globe,
  AlertCircle,
  Download,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Info,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';
import { supabase } from '@/lib/supabaseClient';

interface ApplicantDashboardProps {
  onLogout: () => void;
  userName?: string;
}

type ViewState = 'dashboard' | 'checklists' | 'marketplace' | 'requests' | 'notifications' | 'settings' | 'find' | 'playbook' | 'checklist-preview';

// Database types
interface Country {
  id: string;
  name: string;
  slug: string;
  iso2: string;
  theme_flag_emoji?: string;
}

interface VisaType {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface RequirementTemplate {
  id: string;
  country_id: string;
  visa_type_id: string;
  title: string;
  version: number;
  summary?: string;
  source_url?: string;
  source_org?: string;
  revision_date?: string;
  published_at?: string;
}

interface RequirementTemplateItem {
  id: string;
  template_id: string;
  label: string;
  required: boolean;
  sort_order: number;
  notes_hint?: string;
  category?: string;
  client_key?: string;
}

interface PlaybookSection {
  id: string;
  country_id: string;
  visa_type_id: string;
  section_key: string;
  title: string;
  content_json: Record<string, unknown>;
  sort_order: number;
}

interface PlaybookMeta {
  id: string;
  country_id: string;
  visa_type_id: string;
  processing_time_text?: string;
  typical_cost_text?: string;
  refusal_reasons: string[];
}

interface PlaybookAsset {
  id: string;
  country_id: string;
  visa_type_id: string;
  asset_type: string;
  title: string;
  description?: string;
  file_path?: string;
  external_url?: string;
  sort_order: number;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ onLogout, userName = "User" }) => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const isNewUser = true;

  // Data state
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [template, setTemplate] = useState<RequirementTemplate | null>(null);
  const [templateItems, setTemplateItems] = useState<RequirementTemplateItem[]>([]);
  const [playbookSections, setPlaybookSections] = useState<PlaybookSection[]>([]);
  const [playbookMeta, setPlaybookMeta] = useState<PlaybookMeta | null>(null);
  const [playbookAssets, setPlaybookAssets] = useState<PlaybookAsset[]>([]);

  // Selection state
  const [selectedOriginCountry, setSelectedOriginCountry] = useState<Country | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null); // destination
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase
        .from('countries')
        .select('id, name, slug, iso2, theme_flag_emoji')
        .order('name');
      if (data) setCountries(data);
    };
    fetchCountries();
  }, []);

  // Fetch visa types when both origin and destination are selected (using visa_routes)
  useEffect(() => {
    if (!selectedOriginCountry || !selectedCountry) {
      setVisaTypes([]);
      setSelectedVisaType(null);
      return;
    }
    const fetchVisaTypes = async () => {
      setLoading(true);
      // First try to get visa types from visa_routes (origin -> destination specific)
      const { data: routesData } = await supabase
        .from('visa_routes')
        .select('visa_types(id, name, slug, description)')
        .eq('origin_country_id', selectedOriginCountry.id)
        .eq('destination_country_id', selectedCountry.id)
        .eq('is_active', true);

      if (routesData && routesData.length > 0) {
        const types = routesData
          .map((d) => d.visa_types as unknown as VisaType)
          .filter(Boolean);
        setVisaTypes(types);
      } else {
        // Fallback to country_visa_types if no routes defined
        const { data: fallbackData } = await supabase
          .from('country_visa_types')
          .select('visa_types(id, name, slug, description)')
          .eq('country_id', selectedCountry.id)
          .eq('is_active', true);
        if (fallbackData) {
          const types = fallbackData
            .map((d) => d.visa_types as unknown as VisaType)
            .filter(Boolean);
          setVisaTypes(types);
        }
      }
      setLoading(false);
    };
    fetchVisaTypes();
  }, [selectedOriginCountry, selectedCountry]);

  // Fetch template and playbook data when visa type changes
  useEffect(() => {
    if (!selectedCountry || !selectedVisaType) {
      setTemplate(null);
      setTemplateItems([]);
      setPlaybookSections([]);
      setPlaybookMeta(null);
      setPlaybookAssets([]);
      return;
    }
    const fetchPlaybookData = async () => {
      setLoading(true);
      // Fetch template
      const { data: templateData } = await supabase
        .from('requirement_templates')
        .select('*')
        .eq('country_id', selectedCountry.id)
        .eq('visa_type_id', selectedVisaType.id)
        .eq('is_active', true)
        .single();
      if (templateData) {
        setTemplate(templateData);
        // Fetch template items
        const { data: itemsData } = await supabase
          .from('requirement_template_items')
          .select('*')
          .eq('template_id', templateData.id)
          .order('sort_order');
        if (itemsData) setTemplateItems(itemsData);
      }
      // Fetch playbook sections
      const { data: sectionsData } = await supabase
        .from('playbook_sections')
        .select('*')
        .eq('country_id', selectedCountry.id)
        .eq('visa_type_id', selectedVisaType.id)
        .eq('is_active', true)
        .order('sort_order');
      if (sectionsData) setPlaybookSections(sectionsData);
      // Fetch playbook meta
      const { data: metaData } = await supabase
        .from('playbook_meta')
        .select('*')
        .eq('country_id', selectedCountry.id)
        .eq('visa_type_id', selectedVisaType.id)
        .single();
      if (metaData) setPlaybookMeta(metaData);
      // Fetch playbook assets
      const { data: assetsData } = await supabase
        .from('playbook_assets')
        .select('*')
        .eq('country_id', selectedCountry.id)
        .eq('visa_type_id', selectedVisaType.id)
        .eq('is_active', true)
        .order('sort_order');
      if (assetsData) setPlaybookAssets(assetsData);
      setLoading(false);
    };
    fetchPlaybookData();
  }, [selectedCountry, selectedVisaType]);

  // Create checklist from template
  const handleCreateChecklist = async () => {
    if (!selectedCountry || !selectedVisaType || !template) return;
    setCreatingChecklist(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setCreatingChecklist(false);
      return;
    }
    const userId = sessionData.session.user.id;
    // Check if checklist already exists
    const { data: existing } = await supabase
      .from('checklists')
      .select('id')
      .eq('user_id', userId)
      .eq('country', selectedCountry.name)
      .eq('visa', selectedVisaType.name)
      .single();
    if (existing) {
      // Already exists, just go to dashboard
      setActiveView('checklists');
      setCreatingChecklist(false);
      return;
    }
    // Create checklist
    const { data: newChecklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        user_id: userId,
        country: selectedCountry.name,
        visa: selectedVisaType.name,
        title: `${selectedVisaType.name} - ${selectedCountry.name}`,
        country_id: selectedCountry.id,
        visa_type_id: selectedVisaType.id,
        template_id: template.id,
        template_version_used: template.version,
        template_revision_date_used: template.revision_date,
        template_published_at_used: template.published_at,
      })
      .select()
      .single();
    if (checklistError || !newChecklist) {
      console.error('Failed to create checklist:', checklistError);
      setCreatingChecklist(false);
      return;
    }
    // Create checklist items from template
    const itemsToInsert = templateItems.map((item, idx) => ({
      checklist_id: newChecklist.id,
      user_id: userId,
      label: item.label,
      required: item.required,
      status: 'todo',
      category: item.category,
      sort_order: item.sort_order || idx,
      client_key: item.client_key || `item_${idx}`,
      template_item_id: item.id,
    }));
    if (itemsToInsert.length > 0) {
      await supabase.from('checklist_items').insert(itemsToInsert);
    }
    // Reset selections and go to checklists view
    setSelectedOriginCountry(null);
    setSelectedCountry(null);
    setSelectedVisaType(null);
    setActiveView('checklists');
    setCreatingChecklist(false);
  };

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: activeView === 'dashboard', onClick: () => setActiveView('dashboard') },
    { icon: <CheckSquare size={18} />, label: "My Checklists", active: activeView === 'checklists', onClick: () => setActiveView('checklists') },
    { icon: <ShoppingBag size={18} />, label: "Marketplace", active: activeView === 'marketplace', onClick: () => setActiveView('marketplace') },
    { icon: <FileText size={18} />, label: "My Requests", active: activeView === 'requests', onClick: () => setActiveView('requests') },
    { icon: <Bell size={18} />, label: "Notifications", active: activeView === 'notifications', onClick: () => setActiveView('notifications') },
    { icon: <Settings size={18} />, label: "Profile & Settings", active: activeView === 'settings', onClick: () => setActiveView('settings') },
  ];

  const renderDashboardContent = () => {
    if (isNewUser) {
      return (
        <>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {userName}</h1>
            <p className="text-slate-500 mt-1">Let's get you moving.</p>
          </div>

          {/* Onboarding Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center mb-8">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-slate-100">
                <Compass size={32} strokeWidth={1.5} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-3">Start your first visa checklist</h2>
             <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
               Select your destination and visa type to get official, up-to-date requirements.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button size="lg">Find visa requirements</Button>
               <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Browse popular destinations
               </Button>
             </div>
          </div>

          {/* Reassurance Strip */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-x-8 gap-y-4 mb-12 py-4">
             <div className="flex items-center gap-2 text-slate-500 text-sm">
                <ShieldCheck size={16} className="text-success" />
                <span>Government-sourced requirements</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CheckCircle2 size={16} className="text-success" />
                <span>Always kept up to date</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-sm">
                <UserCheck size={16} className="text-success" />
                <span>Get expert help only if you want it</span>
             </div>
          </div>

          {/* Condensed How it Works */}
          <div className="max-w-5xl mx-auto pt-8 border-t border-slate-200">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-8 text-center">How VysaGuard works</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold mb-4">1</div>
                   <h4 className="font-semibold text-slate-900 mb-2">Choose destination</h4>
                   <p className="text-sm text-slate-500">Input where you want to go and we'll identify the correct visa for you.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold mb-4">2</div>
                   <h4 className="font-semibold text-slate-900 mb-2">Follow checklist</h4>
                   <p className="text-sm text-slate-500">Track official documents and requirements in a structured list.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold mb-4">3</div>
                   <h4 className="font-semibold text-slate-900 mb-2">Get expert help</h4>
                   <p className="text-sm text-slate-500">Optional. Hire verified lawyers or agencies if you need extra support.</p>
                </div>
             </div>
          </div>
        </>
      );
    }

    return (
      <>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h1>
            <p className="text-slate-500 mt-1">Here’s the current status of your visa applications.</p>
          </div>

          {/* Primary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Active Checklist */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 rounded-md bg-green-50 text-success text-xs font-semibold mb-2">Requirements current</span>
                  <h3 className="font-bold text-slate-900">Digital Nomad Visa</h3>
                  <p className="text-sm text-slate-500">Portugal</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-slate-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <Button size="sm" className="w-full">Continue Checklist</Button>
            </div>

            {/* Requirement Status */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="text-success" size={20} />
                 <h3 className="font-bold text-slate-900">Requirement Status</h3>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Last Revised</p>
                    <p className="text-sm font-medium text-slate-900">Jan 10, 2026</p>
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Source</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <p className="text-sm font-medium text-slate-900">Official Gov Portal</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Assistance Status */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-slate-900">Assistance Status</h3>
                    <span className="px-2 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded">Assisted</span>
               </div>
               
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Elena Vance" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-900">Elena Vance, Esq.</p>
                     <p className="text-xs text-slate-500">Immigration Lawyer</p>
                  </div>
               </div>
               
               <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 flex items-center gap-2">
                  <Clock size={12} />
                  <span>Awaiting document review</span>
               </div>
            </div>

          </div>

          {/* Middle Section: My Checklists */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">My Checklists</h3>
                <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">Visa Type</th>
                            <th className="px-6 py-3">Destination</th>
                            <th className="px-6 py-3">Progress</th>
                            <th className="px-6 py-3">Last Updated</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">Digital Nomad Visa</td>
                            <td className="px-6 py-4 text-slate-600">Portugal</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium w-6">65%</span>
                                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">2 hours ago</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">In Progress</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">Tourist Visa (B2)</td>
                            <td className="px-6 py-4 text-slate-600">United States</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium w-6">10%</span>
                                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '10%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">Jan 12, 2026</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Paused</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
      </>
    );
  };

  const renderChecklistsContent = () => {
    return (
      <div className="max-w-2xl mx-auto text-center mt-12 animate-fade-in">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 border border-slate-100">
          <CheckSquare size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">You don’t have any checklists yet</h2>
        <p className="text-slate-500 mb-8">Start by choosing a destination and visa type to see official requirements.</p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by destination country"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-shadow"
          />
        </div>
        <p className="text-xs text-slate-400 mb-10">We’ll show you official requirements before you start.</p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto text-left">
          {/* Option 1 */}
          <div className="flex flex-col gap-2">
             <Button className="w-full" onClick={() => setActiveView('find')}>Build checklist</Button>
             <p className="text-xs text-slate-500 text-center px-2">Track requirements yourself with an official checklist</p>
          </div>
          {/* Option 2 */}
          <div className="flex flex-col gap-2">
             <Button variant="secondary" className="w-full" onClick={() => setActiveView('marketplace')}>Find verified vendors</Button>
             <p className="text-xs text-slate-500 text-center px-2">Get help from licensed agencies or immigration lawyers</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRequestsContent = () => {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Requests</h1>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Elena Vance" className="w-12 h-12 rounded-full object-cover border border-slate-100" />
              <div>
                 <div className="flex items-center gap-2">
                   <h3 className="font-bold text-slate-900">Elena Vance, Esq.</h3>
                   <ShieldCheck size={14} className="text-success fill-green-50" />
                 </div>
                 <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Verified Immigration Lawyer</span>
              </div>
            </div>
            <div className="text-right">
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-accent border border-blue-100">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                 In progress
               </span>
               <p className="text-xs text-slate-400 mt-1">Updated 1 day ago</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Left Column */}
             <div>
               <div className="mb-6">
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Visa Type</p>
                 <p className="font-medium text-slate-900">Canada Express Entry</p>
               </div>
               <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Current Status</p>
                  <p className="font-medium text-slate-900">Reviewing submitted documents</p>
               </div>

               {/* Uploads */}
               <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Documents Uploaded</p>
                  <div className="space-y-2">
                     {['Passport.pdf', 'Bank_Statement.pdf'].map((file, i) => (
                       <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-sm">
                          <div className="flex items-center gap-2.5">
                             <FileText size={16} className="text-slate-400" />
                             <span className="text-slate-700 font-medium">{file}</span>
                          </div>
                          <span className="text-[10px] font-bold text-success bg-green-50 px-2 py-0.5 rounded border border-green-100">RECEIVED</span>
                       </div>
                     ))}
                  </div>
                  <button className="text-xs text-accent font-medium mt-3 hover:underline flex items-center gap-1">
                    Upload additional documents
                  </button>
               </div>
             </div>

             {/* Right Column - Timeline */}
             <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm mb-4">Request Progress</h4>
                <div className="space-y-0 relative">
                   {/* Vertical Line */}
                   <div className="absolute left-[7px] top-2 bottom-6 w-px bg-slate-200"></div>

                   {/* Steps */}
                   <div className="flex gap-4 relative pb-4">
                      <div className="relative z-10 bg-white rounded-full">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                      <div className="text-sm -mt-0.5">
                         <p className="text-slate-900 font-medium">Request submitted</p>
                         <p className="text-xs text-slate-500">Jan 12, 10:30 AM</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative pb-4">
                      <div className="relative z-10 bg-white rounded-full">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                      <div className="text-sm -mt-0.5">
                         <p className="text-slate-900 font-medium">Documents uploaded</p>
                         <p className="text-xs text-slate-500">Jan 12, 10:45 AM</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative pb-4">
                      <div className="relative z-10 bg-white p-[3px] rounded-full border border-accent">
                         <div className="w-2 h-2 rounded-full bg-accent"></div>
                      </div>
                      <div className="text-sm -mt-0.5">
                         <p className="text-slate-900 font-medium">Review in progress</p>
                         <p className="text-xs text-accent font-medium">Current Step</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative opacity-50">
                      <div className="relative z-10 bg-white p-[3px] rounded-full border border-slate-300">
                         <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      </div>
                      <div className="text-sm -mt-0.5">
                         <p className="text-slate-900">Feedback pending</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
             <Button>View request details</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderFindRequirements = () => {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-16">
        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={() => {
              setSelectedOriginCountry(null);
              setSelectedCountry(null);
              setSelectedVisaType(null);
              setActiveView('checklists');
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to My Checklists
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Visa Requirement Search</h1>
          <p className="text-slate-500 mt-1">Find official requirements based on where you're traveling from and to.</p>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center gap-4 mb-10 text-sm font-medium">
          <div className={`flex items-center gap-2 ${selectedOriginCountry ? 'text-primary' : 'text-primary'}`}>
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
            <span>Origin</span>
          </div>
          <div className="w-8 h-px bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${selectedOriginCountry ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${selectedOriginCountry ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
            <span>Destination</span>
          </div>
          <div className="w-8 h-px bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${selectedCountry ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${selectedCountry ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
            <span>Visa Type</span>
          </div>
        </div>

        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a citizen of</label>
            <div className="relative">
              <select
                value={selectedOriginCountry?.id || ''}
                onChange={(e) => {
                  const country = countries.find(c => c.id === e.target.value);
                  setSelectedOriginCountry(country || null);
                  setSelectedCountry(null);
                  setSelectedVisaType(null);
                }}
                className="w-full h-12 pl-4 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>Select origin country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.theme_flag_emoji} {c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Traveling to</label>
            <div className="relative">
              <select
                value={selectedCountry?.id || ''}
                onChange={(e) => {
                  const country = countries.find(c => c.id === e.target.value);
                  setSelectedCountry(country || null);
                  setSelectedVisaType(null);
                }}
                disabled={!selectedOriginCountry}
                className="w-full h-12 pl-4 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select destination</option>
                {countries.filter(c => c.id !== selectedOriginCountry?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.theme_flag_emoji} {c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* Results / Visa Types */}
        {selectedOriginCountry && selectedCountry && (
          <div className="animate-fade-in">
            {/* Info Banner */}
            <div className={`p-4 rounded-lg border mb-8 flex items-start gap-3 ${
              visaTypes.length === 0 ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
            }`}>
              {visaTypes.length === 0 ? (
                <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
              ) : (
                <Info className="text-accent shrink-0 mt-0.5" size={20} />
              )}
              <div>
                <p className={`text-sm font-medium ${visaTypes.length === 0 ? 'text-amber-900' : 'text-blue-900'}`}>
                  {visaTypes.length === 0
                    ? `No visa routes found for ${selectedOriginCountry.name} → ${selectedCountry.name}. Please check back later.`
                    : `${visaTypes.length} visa type${visaTypes.length > 1 ? 's' : ''} available for ${selectedOriginCountry.name} citizens traveling to ${selectedCountry.name}.`
                  }
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] opacity-80">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Source: Official Government Data
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Last verified: Jan 2026
                  </span>
                </div>
              </div>
            </div>

            {visaTypes.length > 0 && (
              <>
                <h3 className="font-bold text-slate-900 mb-4">Select Visa Type</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <span className="animate-pulse">Loading visa types...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {visaTypes.map((visa) => (
                      <button
                        key={visa.id}
                        onClick={() => setSelectedVisaType(visa)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedVisaType?.id === visa.id
                            ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-900 text-sm">{visa.name}</span>
                          {selectedVisaType?.id === visa.id && <CheckCircle2 size={16} className="text-primary" />}
                        </div>
                        <p className="text-xs text-slate-500">{visa.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                  <Button disabled={!selectedVisaType} onClick={() => setActiveView('playbook')}>
                    View playbook
                  </Button>
                  <Button variant="outline" disabled={!selectedVisaType} onClick={() => setActiveView('checklist-preview')}>
                    Save as checklist
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderPlaybook = () => {
    if (!selectedCountry || !selectedVisaType) {
      setActiveView('find');
      return null;
    }

    const requiredItems = templateItems.filter(item => item.required);
    const conditionalItems = templateItems.filter(item => !item.required);
    const versionNumber = template?.version ? `v${template.version}.0` : 'v1.0';
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => setActiveView('find')}
            className="text-slate-500 hover:text-primary cursor-pointer"
          >
            Find Requirements
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-900 font-medium">Playbook</span>
        </nav>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          {/* Title Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {selectedVisaType.name} {selectedCountry.theme_flag_emoji && `(${selectedCountry.name})`}
              </h1>
              <p className="text-slate-500 text-sm">
                {template?.summary || `Official requirements for ${selectedVisaType.name} to ${selectedCountry.name}.`}
              </p>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <ShieldCheck size={12} />
              Official-sourced
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {versionNumber}
            </span>
            {template && template.version > 1 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Supersedes previous version
              </span>
            )}
          </div>

          {/* What Changed Collapsible */}
          {template && template.version > 1 && (
            <div className="border border-slate-200 rounded-lg mb-6">
              <button
                onClick={() => setExpandedChanges(!expandedChanges)}
                className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700">What changed in this version?</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${expandedChanges ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedChanges && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Updated document requirements based on latest official guidelines</li>
                    <li>Added new conditional requirements for specific applicant categories</li>
                    <li>Revised processing time estimates</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Meta Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Source Authority</p>
              <p className="text-sm font-medium text-slate-900">{template?.source_org || 'Government Portal'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Published</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(template?.published_at)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Last Verified</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(template?.revision_date)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Revision Date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(template?.revision_date)}</p>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Processing Time Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-slate-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Processing Time</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {playbookMeta?.processing_time_text || '2-4 weeks'}
            </p>
          </div>

          {/* Typical Costs Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-slate-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Typical Costs</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {playbookMeta?.typical_cost_text || 'Varies'}
            </p>
          </div>

          {/* Meta Updated Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-success" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Meta Updated</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {formatDate(template?.revision_date)}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Requirements Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Requirements Checklist</h3>
                <span className="text-xs text-slate-500">{templateItems.length} items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {requiredItems.map((item, idx) => (
                  <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                          REQUIRED
                        </span>
                      </div>
                      {item.notes_hint && (
                        <p className="text-sm text-slate-500 mt-1">{item.notes_hint}</p>
                      )}
                    </div>
                  </div>
                ))}
                {conditionalItems.map((item, idx) => (
                  <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          CONDITIONAL
                        </span>
                      </div>
                      {item.notes_hint && (
                        <p className="text-sm text-slate-500 mt-1">{item.notes_hint}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Official Assets Box */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">OFFICIAL ASSETS</h3>
              </div>
              <div className="p-4 space-y-3">
                {playbookAssets.length > 0 ? (
                  playbookAssets.map(asset => (
                    <a
                      key={asset.id}
                      href={asset.external_url || asset.file_path || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {asset.asset_type === 'download' ? (
                        <Download size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <ExternalLink size={16} className="text-primary flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{asset.title}</p>
                        {asset.description && (
                          <p className="text-xs text-slate-500 truncate">{asset.description}</p>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-slate-400">
                    No official assets available
                  </div>
                )}
                {template?.source_url && (
                  <a
                    href={template.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <Globe size={16} className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">Official Gov Website</p>
                      <p className="text-xs text-slate-500 truncate">View source requirements</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
              <h3 className="font-bold text-slate-900 mb-2">Ready to start?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Create a personalized checklist to track your progress.
              </p>
              <Button
                className="w-full"
                onClick={() => setActiveView('checklist-preview')}
              >
                Create Checklist
              </Button>
            </div>
          </div>
        </div>

        {/* Playbook Guide Accordion */}
        {playbookSections.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Playbook Guide</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {playbookSections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900">{section.title}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedSections.includes(section.id) && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                      {typeof section.content_json === 'object' && section.content_json !== null ? (
                        <div className="prose prose-sm prose-slate max-w-none">
                          {(section.content_json as { paragraphs?: string[] }).paragraphs?.map((p: string, i: number) => (
                            <p key={i} className="text-slate-600 mb-2">{p}</p>
                          ))}
                          {(section.content_json as { bullets?: string[] }).bullets && (
                            <ul className="list-disc list-inside space-y-1 text-slate-600">
                              {(section.content_json as { bullets: string[] }).bullets.map((b: string, i: number) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-600">{String(section.content_json)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Refusal Reasons */}
        {playbookMeta?.refusal_reasons && playbookMeta.refusal_reasons.length > 0 && (
          <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="font-bold text-amber-900">Common Refusal Reasons</h3>
            </div>
            <ul className="space-y-2">
              {playbookMeta.refusal_reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-amber-800">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderChecklistPreview = () => {
    if (!selectedCountry || !selectedVisaType || !template) {
      setActiveView('find');
      return null;
    }

    const requiredItems = templateItems.filter(item => item.required);
    const optionalItems = templateItems.filter(item => !item.required);

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => setActiveView('playbook')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Requirements
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{selectedCountry.theme_flag_emoji || '🌍'}</span>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{selectedVisaType.name}</h1>
                <p className="text-slate-500 text-sm">{selectedCountry.name}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              You're about to create a checklist with <strong>{templateItems.length} items</strong> to track.
            </p>
          </div>

          {/* Preview */}
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Checklist Preview</h3>
            <div className="space-y-2">
              {requiredItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white flex-shrink-0" />
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-xs text-red-500 font-medium">Required</span>
                </div>
              ))}
              {requiredItems.length > 5 && (
                <p className="text-xs text-slate-500 pl-7">
                  + {requiredItems.length - 5} more required items
                </p>
              )}
              {optionalItems.length > 0 && (
                <p className="text-xs text-slate-500 pl-7 mt-2">
                  + {optionalItems.length} optional items
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={handleCreateChecklist}
              disabled={creatingChecklist}
            >
              {creatingChecklist ? 'Creating...' : 'Create Checklist'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setActiveView('playbook')}
            >
              Review Requirements
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout 
      userType="Applicant" 
      userName={userName} 
      sidebarItems={sidebarItems}
      onLogout={onLogout}
    >
      {activeView === 'dashboard' && renderDashboardContent()}
      {activeView === 'checklists' && renderChecklistsContent()}
      {activeView === 'requests' && renderRequestsContent()}
      {activeView === 'find' && renderFindRequirements()}
      {activeView === 'playbook' && renderPlaybook()}
      {activeView === 'checklist-preview' && renderChecklistPreview()}
      {(activeView === 'marketplace' || activeView === 'notifications' || activeView === 'settings') && (
        <div className="text-center py-20 text-slate-400">
          <p>This view is not part of the current design task.</p>
          <Button variant="ghost" className="mt-4" onClick={() => setActiveView('dashboard')}>Return to Dashboard</Button>
        </div>
      )}
    </DashboardLayout>
  );
};