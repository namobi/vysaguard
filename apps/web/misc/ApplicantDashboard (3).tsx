import React, { useState } from 'react';
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
  Info,
  AlertTriangle,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Calendar,
  Database,
  History,
  FileCode,
  MessageSquare,
  Upload,
  File,
  Filter,
  PieChart,
  Trash2,
  Plus,
  Paperclip,
  X
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';

interface ApplicantDashboardProps {
  onLogout: () => void;
}

type ViewState = 'dashboard' | 'checklists' | 'marketplace' | 'requests' | 'notifications' | 'settings' | 'find' | 'playbook' | 'checklist-preview';

// --- SCHEMA MAPPING INTERFACES ---

interface Country {
  id: string;
  name: string;
  slug: string;
  iso2: string;
  iso3: string;
  created_at: string;
  theme_primary: string;
  theme_secondary: string;
  theme_bg: string;
  theme_flag_emoji: string;
  theme_icon: string;
  hero_image_url: string;
  hero_image_alt: string;
  hero_image_blurhash: string;
}

interface VisaType {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

interface VisaRoute {
  id: string;
  origin_country_id: string;
  destination_country_id: string;
  visa_type_id: string;
  is_active: boolean;
  created_at: string;
}

interface RequirementTemplate {
  id: string;
  country_id: string;
  visa_type_id: string;
  title: string;
  summary: string;
  version: string;
  is_active: boolean;
  status: 'published' | 'draft' | 'archived';
  source_url: string;
  source_org: string;
  revision_date: string;
  published_at: string;
  last_verified_at: string;
  change_summary?: string;
  supersedes_template_id?: string;
  created_at: string;
  updated_at: string;
}

interface RequirementTemplateItem {
  id: string;
  template_id: string;
  label: string;
  required: boolean;
  category: string;
  sort_order: number;
  notes_hint: string;
  client_key: string;
  created_at: string;
}

interface PlaybookSection {
  id: string;
  country_id: string;
  visa_type_id: string;
  section_key: string;
  title: string;
  content_json: string; // Simplified to string for this demo
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlaybookMeta {
  id: string;
  country_id: string;
  visa_type_id: string;
  processing_time_text: string;
  typical_cost_text: string;
  refusal_reasons: string[]; // jsonb mapped to array
  updated_at: string;
}

interface PlaybookAsset {
  id: string;
  country_id: string;
  visa_type_id: string;
  asset_type: 'pdf' | 'link' | 'form';
  title: string;
  description: string;
  file_path?: string;
  external_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Composite object for the view
interface FullPlaybookData {
  template: RequirementTemplate;
  items: RequirementTemplateItem[];
  sections: PlaybookSection[];
  meta: PlaybookMeta;
  assets: PlaybookAsset[];
  visa_type: VisaType;
  country: Country;
}

// --- USER CHECKLIST STATE INTERFACES ---

interface UploadedFile {
  name: string;
  size: string;
  date: string;
}

interface UserChecklistItem extends RequirementTemplateItem {
  status: 'To Do' | 'Uploaded' | 'Verified';
  uploads: UploadedFile[];
  personal_notes: string;
}

interface UserChecklist {
  id: string;
  template_id: string;
  title: string;
  destination_country: string;
  visa_type_name: string;
  version: string;
  revision_date: string;
  created_at: string;
  last_updated: string;
  progress: number;
  items: UserChecklistItem[];
  source_org: string;
  source_url: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  type: 'general' | 'item';
  itemId?: string;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<ViewState>('checklists');
  const [searchOriginId, setSearchOriginId] = useState<string>('');
  const [searchDestinationId, setSearchDestinationId] = useState<string>('');
  const [selectedVisaTypeId, setSelectedVisaTypeId] = useState<string>('');
  
  // State for accordion in playbook
  const [expandedSection, setExpandedSection] = useState<string | null>('eligibility');
  const [isChangeSummaryOpen, setIsChangeSummaryOpen] = useState<boolean>(false);

  // --- USER DATA STATE ---
  const [myChecklists, setMyChecklists] = useState<UserChecklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'item'>('general');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: activeView === 'dashboard', onClick: () => setActiveView('dashboard') },
    { icon: <CheckSquare size={18} />, label: "My Checklists", active: ['checklists', 'find', 'playbook', 'checklist-preview'].includes(activeView), onClick: () => setActiveView('checklists') },
    { icon: <ShoppingBag size={18} />, label: "Marketplace", active: activeView === 'marketplace', onClick: () => setActiveView('marketplace') },
    { icon: <FileText size={18} />, label: "My Requests", active: activeView === 'requests', onClick: () => setActiveView('requests') },
    { icon: <Bell size={18} />, label: "Notifications", active: activeView === 'notifications', onClick: () => setActiveView('notifications') },
    { icon: <Settings size={18} />, label: "Profile & Settings", active: activeView === 'settings', onClick: () => setActiveView('settings') },
  ];

  // --- DUMMY DATA ---
  
  const countries: Country[] = [
    {
      id: 'ca', name: 'Canada', slug: 'canada', iso2: 'CA', iso3: 'CAN', created_at: '2025-01-01',
      theme_primary: '#FF0000', theme_secondary: '#FFFFFF', theme_bg: '#FFF5F5', theme_flag_emoji: '🇨🇦', theme_icon: 'maple-leaf',
      hero_image_url: '', hero_image_alt: 'Canada Landscape', hero_image_blurhash: ''
    },
    {
      id: 'ng', name: 'Nigeria', slug: 'nigeria', iso2: 'NG', iso3: 'NGA', created_at: '2025-01-01',
      theme_primary: '#008751', theme_secondary: '#FFFFFF', theme_bg: '#F0FFF4', theme_flag_emoji: '🇳🇬', theme_icon: 'eagle',
      hero_image_url: '', hero_image_alt: 'Lagos Skyline', hero_image_blurhash: ''
    },
    {
      id: 'us', name: 'United States', slug: 'united-states', iso2: 'US', iso3: 'USA', created_at: '2025-01-01',
      theme_primary: '#3C3B6E', theme_secondary: '#B22234', theme_bg: '#F8FAFC', theme_flag_emoji: '🇺🇸', theme_icon: 'star',
      hero_image_url: '', hero_image_alt: 'NYC Skyline', hero_image_blurhash: ''
    }
  ];

  const visaTypes: VisaType[] = [
    { id: 'b2', name: 'Tourist / Visit (B-2)', slug: 'b2-tourist', description: 'For tourism, vacation, or visiting family.', created_at: '2025-01-01' },
    { id: 'b1', name: 'Business Visit (B-1)', slug: 'b1-business', description: 'For business associates, conferences, or negotiations.', created_at: '2025-01-01' },
    { id: 'f1', name: 'Study (F-1)', slug: 'f1-student', description: 'For academic studies.', created_at: '2025-01-01' },
    { id: 'tn', name: 'Work (TN)', slug: 'tn-nafta', description: 'NAFTA professional worker.', created_at: '2025-01-01' },
    { id: 'c', name: 'Transit (C)', slug: 'c-transit', description: 'Immediate and continuous transit.', created_at: '2025-01-01' },
    { id: 'j1', name: 'Exchange (J-1)', slug: 'j1-exchange', description: 'Exchange visitor program.', created_at: '2025-01-01' },
    { id: 'h1b', name: 'Work (H-1B)', slug: 'h1b-specialty', description: 'Specialty occupations.', created_at: '2025-01-01' }
  ];

  const visaRoutes: VisaRoute[] = [
    // Canada -> US
    { id: 'r1', origin_country_id: 'ca', destination_country_id: 'us', visa_type_id: 'b2', is_active: true, created_at: '2025-01-01' },
    { id: 'r2', origin_country_id: 'ca', destination_country_id: 'us', visa_type_id: 'b1', is_active: true, created_at: '2025-01-01' },
    { id: 'r3', origin_country_id: 'ca', destination_country_id: 'us', visa_type_id: 'f1', is_active: true, created_at: '2025-01-01' },
    { id: 'r4', origin_country_id: 'ca', destination_country_id: 'us', visa_type_id: 'tn', is_active: true, created_at: '2025-01-01' },
    { id: 'r5', origin_country_id: 'ca', destination_country_id: 'us', visa_type_id: 'c', is_active: true, created_at: '2025-01-01' },
    // Nigeria -> US
    { id: 'r6', origin_country_id: 'ng', destination_country_id: 'us', visa_type_id: 'b2', is_active: true, created_at: '2025-01-01' },
    { id: 'r7', origin_country_id: 'ng', destination_country_id: 'us', visa_type_id: 'b1', is_active: true, created_at: '2025-01-01' },
    { id: 'r8', origin_country_id: 'ng', destination_country_id: 'us', visa_type_id: 'f1', is_active: true, created_at: '2025-01-01' },
    { id: 'r9', origin_country_id: 'ng', destination_country_id: 'us', visa_type_id: 'j1', is_active: true, created_at: '2025-01-01' },
    { id: 'r10', origin_country_id: 'ng', destination_country_id: 'us', visa_type_id: 'h1b', is_active: true, created_at: '2025-01-01' },
  ];

  // Templates
  const templates: RequirementTemplate[] = [
    {
      id: 'tpl_ca_us_b2', country_id: 'us', visa_type_id: 'b2',
      title: 'US Tourist Visa (Exempt)', summary: 'Visa exemption rules for Canadian citizens visiting the US.',
      version: 'v1.3', is_active: true, status: 'published',
      source_url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
      source_org: 'U.S. Department of State / CBP',
      revision_date: '2026-01-10', published_at: '2024-01-01', last_verified_at: '2026-01-10',
      change_summary: 'Updated entry requirements to reflect new biometric screenings at select land borders.',
      supersedes_template_id: 'tpl_ca_us_b2_v1.2',
      created_at: '2024-01-01', updated_at: '2026-01-10'
    },
    {
      id: 'tpl_ng_us_b2', country_id: 'us', visa_type_id: 'b2',
      title: 'US Visitor Visa (B-2)', summary: 'Standard B-2 visa application process for Nigerian citizens.',
      version: 'v2.1', is_active: true, status: 'published',
      source_url: 'https://ng.usembassy.gov/visas/nonimmigrant-visas/',
      source_org: 'U.S. Department of State / Lagos Consulate',
      revision_date: '2026-01-05', published_at: '2024-06-15', last_verified_at: '2026-01-12',
      created_at: '2024-06-15', updated_at: '2026-01-12'
    }
  ];

  // Items
  const items: RequirementTemplateItem[] = [
    // Canada B2 Items
    { id: 'i1', template_id: 'tpl_ca_us_b2', label: 'Valid Canadian Passport', required: true, category: 'Identity', sort_order: 1, notes_hint: 'Must be valid until date of intended departure.', client_key: 'passport_ca', created_at: '2025-01-01'},
    { id: 'i2', template_id: 'tpl_ca_us_b2', label: 'Proof of Citizenship', required: true, category: 'Identity', sort_order: 2, notes_hint: 'Original birth certificate or citizenship card.', client_key: 'citizenship_proof', created_at: '2025-01-01'},
    { id: 'i3', template_id: 'tpl_ca_us_b2', label: 'Evidence of Temporary Intent', required: false, category: 'Supporting', sort_order: 3, notes_hint: 'Proof of employment or residence in Canada.', client_key: 'ties_home', created_at: '2025-01-01'},
    { id: 'i4', template_id: 'tpl_ca_us_b2', label: 'Proof of Funds', required: false, category: 'Financial', sort_order: 4, notes_hint: 'Bank statements showing ability to support stay.', client_key: 'funds_proof', created_at: '2025-01-01'},
    
    // Nigeria B2 Items
    { id: 'i10', template_id: 'tpl_ng_us_b2', label: 'Valid International Passport', required: true, category: 'Identity', sort_order: 1, notes_hint: 'Valid for at least 6 months beyond period of stay.', client_key: 'passport_int', created_at: '2025-01-01'},
    { id: 'i11', template_id: 'tpl_ng_us_b2', label: 'DS-160 Confirmation Page', required: true, category: 'Application', sort_order: 2, notes_hint: 'Barcode page from CEAC submission.', client_key: 'ds160_conf', created_at: '2025-01-01'},
    { id: 'i12', template_id: 'tpl_ng_us_b2', label: 'Appointment Confirmation', required: true, category: 'Application', sort_order: 3, notes_hint: 'Printout of appointment letter.', client_key: 'appt_conf', created_at: '2025-01-01'},
    { id: 'i13', template_id: 'tpl_ng_us_b2', label: 'MRV Fee Receipt', required: true, category: 'Financial', sort_order: 4, notes_hint: 'Proof of payment for visa application fee.', client_key: 'fee_receipt', created_at: '2025-01-01'},
    { id: 'i14', template_id: 'tpl_ng_us_b2', label: 'Proof of Ties to Home Country', required: true, category: 'Supporting', sort_order: 5, notes_hint: 'Employment letter, property deeds, etc.', client_key: 'home_ties', created_at: '2025-01-01'},
    { id: 'i15', template_id: 'tpl_ng_us_b2', label: 'Bank Statements', required: true, category: 'Financial', sort_order: 6, notes_hint: 'Last 6 months of account activity.', client_key: 'bank_stmts', created_at: '2025-01-01'},
  ];

  // Playbook Sections
  const sections: PlaybookSection[] = [
    // Canada B2
    { id: 's1', country_id: 'us', visa_type_id: 'b2', section_key: 'eligibility', title: 'Eligibility', content_json: 'Canadian citizens generally do not require a visa to enter the United States directly from Canada for the purposes of visiting or tourism.', sort_order: 1, is_active: true, created_at: '2025-01-01', updated_at: '2025-12-01'},
    { id: 's2', country_id: 'us', visa_type_id: 'b2', section_key: 'entry_process', title: 'Entry Process', content_json: 'Present your valid Canadian passport to the CBP officer at the Port of Entry.', sort_order: 2, is_active: true, created_at: '2025-01-01', updated_at: '2025-12-01'},
    { id: 's3', country_id: 'us', visa_type_id: 'b2', section_key: 'length_stay', title: 'Length of Stay & Extensions', content_json: 'Typically granted for up to 6 months. The exact date is stamped on your passport or recorded digitally (I-94).', sort_order: 3, is_active: true, created_at: '2025-01-01', updated_at: '2025-12-01'},
    
    // Nigeria B2 (Adding these but filtering in logic)
    { id: 's4', country_id: 'us', visa_type_id: 'b2', section_key: 'eligibility_ng', title: 'Eligibility', content_json: 'You must demonstrate that you plan to remain in the U.S. for a temporary, specific period and have binding ties to Nigeria.', sort_order: 1, is_active: true, created_at: '2025-01-01', updated_at: '2026-01-05'},
    { id: 's5', country_id: 'us', visa_type_id: 'b2', section_key: 'entry_ng', title: 'Entry Process', content_json: 'Requires DS-160 application, fee payment, interview appointment at Abuja or Lagos, and visa issuance.', sort_order: 2, is_active: true, created_at: '2025-01-01', updated_at: '2026-01-05'},
    { id: 's6', country_id: 'us', visa_type_id: 'b2', section_key: 'tips_ng', title: 'Border Interview Tips', content_json: 'Be honest, consistent with your application, and have your return ticket and accommodation details ready.', sort_order: 3, is_active: true, created_at: '2025-01-01', updated_at: '2026-01-05'},
  ];

  // Playbook Meta
  const metas: PlaybookMeta[] = [
    { id: 'm1', country_id: 'us', visa_type_id: 'b2', processing_time_text: 'Immediate (at border)', typical_cost_text: '$0 (No ESTA for land/air)', refusal_reasons: ['Criminal inadmissibility', 'Intent to work illegally', 'Previous overstays'], updated_at: '2025-11-20' },
    // For demo purposes, we'll swap content dynamically based on origin for the US B2 view if we were fully relational, but here I'll just hardcode logic to pick the right meta content in the getter.
  ];
  
  // Specific Meta for Nigeria (overriding m1 in logic)
  const metaNg: PlaybookMeta = { id: 'm2', country_id: 'us', visa_type_id: 'b2', processing_time_text: '45 - 120 Days', typical_cost_text: '$185 USD (MRV Fee)', refusal_reasons: ['Section 214(b) - Immigrant Intent', 'Insufficient funds', 'Incomplete DS-160'], updated_at: '2026-01-10' };

  // Assets
  const assets: PlaybookAsset[] = [
    { id: 'a1', country_id: 'us', visa_type_id: 'b2', asset_type: 'link', title: 'Official CBP Guidance', description: 'For Canadian citizens', external_url: 'https://www.cbp.gov', sort_order: 1, is_active: true, created_at: '2025-01-01' },
    { id: 'a2', country_id: 'us', visa_type_id: 'b2', asset_type: 'link', title: 'I-94 Website', description: 'Check arrival/departure history', external_url: 'https://i94.cbp.dhs.gov', sort_order: 2, is_active: true, created_at: '2025-01-01' },
    
    { id: 'a3', country_id: 'us', visa_type_id: 'b2', asset_type: 'link', title: 'DS-160 Portal', description: 'Application form', external_url: 'https://ceac.state.gov', sort_order: 1, is_active: true, created_at: '2025-01-01' },
    { id: 'a4', country_id: 'us', visa_type_id: 'b2', asset_type: 'link', title: 'US Travel Docs', description: 'Appointment scheduling', external_url: 'https://ustraveldocs.com', sort_order: 2, is_active: true, created_at: '2025-01-01' },
    { id: 'a5', country_id: 'us', visa_type_id: 'b2', asset_type: 'pdf', title: 'Interview Prep', description: 'Checklist PDF', file_path: '/assets/prep.pdf', sort_order: 3, is_active: true, created_at: '2025-01-01' },
  ];

  // Helper to resolve data based on selection
  const getPlaybookData = (): FullPlaybookData | null => {
    if (!searchOriginId || !searchDestinationId || !selectedVisaTypeId) return null;

    const country = countries.find(c => c.id === searchDestinationId);
    const visaType = visaTypes.find(v => v.id === selectedVisaTypeId);

    if (!country || !visaType) return null;

    // Logic to select correct template based on origin (approximating database query)
    let templateId = '';
    let metaData = metas[0];
    let sectionsData = sections.slice(0, 3);
    let assetsData = assets.slice(0, 2);

    if (searchOriginId === 'ca' && searchDestinationId === 'us' && selectedVisaTypeId === 'b2') {
      templateId = 'tpl_ca_us_b2';
      metaData = metas[0];
      sectionsData = sections.slice(0, 3);
      assetsData = assets.slice(0, 2);
    } else if (searchOriginId === 'ng' && searchDestinationId === 'us' && selectedVisaTypeId === 'b2') {
      templateId = 'tpl_ng_us_b2';
      metaData = metaNg;
      sectionsData = sections.slice(3, 6);
      assetsData = assets.slice(2, 5);
    } else {
        // Fallback for demo stability
        templateId = 'tpl_ca_us_b2'; 
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    const templateItems = items.filter(i => i.template_id === templateId).sort((a, b) => a.sort_order - b.sort_order);

    return {
      template,
      items: templateItems,
      sections: sectionsData,
      meta: metaData,
      assets: assetsData,
      visa_type: visaType,
      country: country
    };
  };

  // --- ACTIONS ---

  const handleCreateChecklist = () => {
      const data = getPlaybookData();
      if (!data) return;

      const newChecklist: UserChecklist = {
          id: `cl_${Date.now()}`,
          template_id: data.template.id,
          title: data.template.title,
          destination_country: data.country.name,
          visa_type_name: data.visa_type.name,
          version: data.template.version,
          revision_date: data.template.revision_date,
          created_at: new Date().toLocaleDateString(),
          last_updated: "Just now",
          progress: 0,
          source_org: data.template.source_org,
          source_url: data.template.source_url,
          items: data.items.map(i => ({
              ...i,
              status: 'To Do',
              uploads: [],
              personal_notes: ''
          }))
      };

      setMyChecklists(prev => [newChecklist, ...prev]);
      setSelectedChecklistId(newChecklist.id);
      setActiveView('checklists');
  };

  const handleItemStatusChange = (checklistId: string, itemId: string, status: 'To Do' | 'Uploaded' | 'Verified') => {
      setMyChecklists(prev => prev.map(cl => {
          if (cl.id !== checklistId) return cl;
          const updatedItems = cl.items.map(item => item.id === itemId ? { ...item, status } : item);
          const completed = updatedItems.filter(i => i.status === 'Verified' || i.status === 'Uploaded').length;
          const progress = Math.round((completed / updatedItems.length) * 100);
          return { ...cl, items: updatedItems, progress, last_updated: 'Just now' };
      }));
  };

  const handleFileUpload = (checklistId: string, itemId: string) => {
      // Mock file upload
      const mockFile: UploadedFile = {
          name: `document_${Math.floor(Math.random() * 1000)}.pdf`,
          size: '1.2 MB',
          date: new Date().toLocaleDateString()
      };

      setMyChecklists(prev => prev.map(cl => {
          if (cl.id !== checklistId) return cl;
          return {
              ...cl,
              items: cl.items.map(item => 
                  item.id === itemId 
                  ? { ...item, uploads: [...item.uploads, mockFile], status: 'Uploaded' }
                  : item
              )
          };
      }));
  };

  const handleAddComment = () => {
      if (!commentInput.trim() || !selectedChecklistId) return;
      const newComment: Comment = {
          id: `c_${Date.now()}`,
          author: 'You',
          text: commentInput,
          timestamp: 'Just now',
          type: activeTab,
          itemId: activeTab === 'item' && selectedItemId ? selectedItemId : undefined
      };
      setComments([...comments, newComment]);
      setCommentInput('');
  };

  const renderDashboardContent = () => {
    // Reusing existing code for New User Dashboard
    return (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, Sarah</h1>
            <p className="text-slate-500 mt-1">Let's get you moving.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center mb-8">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-slate-100">
                <Compass size={32} strokeWidth={1.5} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-3">Start your first visa checklist</h2>
             <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
               Select your destination and visa type to get official, up-to-date requirements.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button size="lg" onClick={() => setActiveView('find')}>Find visa requirements</Button>
               <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Browse popular destinations
               </Button>
             </div>
          </div>

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
  };

  const renderChecklistsContent = () => {
    // Empty state if no checklists created yet
    if (myChecklists.length === 0) {
        return (
          <div className="max-w-2xl mx-auto text-center mt-12 animate-fade-in">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 border border-slate-100">
              <CheckSquare size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">You don’t have any checklists yet</h2>
            <p className="text-slate-500 mb-8">Start by choosing a destination and visa type to see official requirements.</p>

            <div className="relative max-w-md mx-auto mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by destination country"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-shadow"
              />
            </div>
            <p className="text-xs text-slate-400 mb-10">We’ll show you official requirements before you start.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto text-left">
              <div className="flex flex-col gap-2">
                 <Button className="w-full" onClick={() => setActiveView('find')}>Build checklist</Button>
                 <p className="text-xs text-slate-500 text-center px-2">Track requirements yourself with an official checklist</p>
              </div>
              <div className="flex flex-col gap-2">
                 <Button variant="secondary" className="w-full" onClick={() => setActiveView('marketplace')}>Find verified vendors</Button>
                 <p className="text-xs text-slate-500 text-center px-2">Get help from licensed agencies or immigration lawyers</p>
              </div>
            </div>
          </div>
        );
    }

    // Full Management Dashboard
    const activeChecklist = myChecklists.find(cl => cl.id === selectedChecklistId) || myChecklists[0];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            {/* Top Bar: Checklist Selectors */}
            <div className="flex gap-4 overflow-x-auto pb-6 mb-2 border-b border-slate-200">
                <Button size="sm" variant="outline" className="shrink-0 gap-2 border-dashed" onClick={() => setActiveView('find')}>
                    <Plus size={16} /> New Checklist
                </Button>
                {myChecklists.map(cl => (
                    <button 
                        key={cl.id}
                        onClick={() => setSelectedChecklistId(cl.id)}
                        className={`shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${
                            activeChecklist.id === cl.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold leading-none mb-1">{cl.title}</span>
                            <span className={`text-[10px] leading-none ${activeChecklist.id === cl.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                {cl.progress}% complete
                            </span>
                        </div>
                        {activeChecklist.id === cl.id && <ChevronDown size={14} />}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Main Content: Checklist Detail */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-slate-900">{activeChecklist.title}</h2>
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide rounded">
                                    {activeChecklist.version}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> Last updated: {activeChecklist.last_updated}
                                </span>
                                <a href={activeChecklist.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                                    <ExternalLink size={12} /> {activeChecklist.source_org}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="secondary" size="sm">Export</Button>
                             <Button size="sm">Submit Application</Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100">
                        <div className="h-full bg-success transition-all duration-500" style={{ width: `${activeChecklist.progress}%` }}></div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1 overflow-y-auto p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 w-[45%]">Requirement</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Documents</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeChecklist.items.map(item => (
                                    <tr 
                                        key={item.id} 
                                        className={`group hover:bg-slate-50/80 transition-colors ${selectedItemId === item.id ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => { setSelectedItemId(item.id); setActiveTab('item'); }}
                                    >
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    item.status === 'Verified' ? 'bg-success border-success text-white' : 
                                                    item.status === 'Uploaded' ? 'bg-primary border-primary text-white' :
                                                    'border-slate-300'
                                                }`}>
                                                    {item.status === 'Verified' && <Check size={10} strokeWidth={4} />}
                                                    {item.status === 'Uploaded' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium mb-1 ${item.status === 'Verified' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                        {item.label}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {item.required && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">REQUIRED</span>}
                                                        <span className="text-[10px] text-slate-400">{item.category}</span>
                                                    </div>
                                                    {item.notes_hint && <p className="text-xs text-slate-500 mt-1 italic">{item.notes_hint}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <select 
                                                value={item.status}
                                                onChange={(e) => handleItemStatusChange(activeChecklist.id, item.id, e.target.value as any)}
                                                className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${
                                                    item.status === 'Verified' ? 'bg-green-50 text-success border-green-200' :
                                                    item.status === 'Uploaded' ? 'bg-blue-50 text-primary border-blue-200' :
                                                    'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="To Do">To Do</option>
                                                <option value="Uploaded">Uploaded</option>
                                                <option value="Verified">Verified</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {item.uploads.length > 0 ? (
                                                <div className="space-y-1">
                                                    {item.uploads.map((file, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded">
                                                            <Paperclip size={10} className="text-slate-400" />
                                                            <span className="truncate max-w-[120px]">{file.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No files</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right align-top">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded"
                                                    title="Upload Document"
                                                    onClick={(e) => { e.stopPropagation(); handleFileUpload(activeChecklist.id, item.id); }}
                                                >
                                                    <Upload size={16} />
                                                </button>
                                                <button 
                                                    className={`p-1.5 rounded ${selectedItemId === item.id && activeTab === 'item' ? 'text-primary bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                                    title="Comments"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); setActiveTab('item'); }}
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Comments & Activity */}
                <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">
                    <div className="flex border-b border-slate-100">
                        <button 
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('general')}
                        >
                            General Notes
                        </button>
                        <button 
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === 'item' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('item')}
                        >
                            Item Comments
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
                        {activeTab === 'item' && !selectedItemId ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                                <MessageSquare size={24} className="mb-2 opacity-20" />
                                <p className="text-sm">Select an item from the list to view or add comments.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments
                                    .filter(c => activeTab === 'general' ? c.type === 'general' : c.itemId === selectedItemId)
                                    .map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                            {comment.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-700">
                                                {comment.text}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 pl-1">{comment.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.filter(c => activeTab === 'general' ? c.type === 'general' : c.itemId === selectedItemId).length === 0 && (
                                    <p className="text-xs text-center text-slate-400 italic py-4">No comments yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="relative">
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder={activeTab === 'item' && !selectedItemId ? "Select an item first..." : "Type a note..."}
                                disabled={activeTab === 'item' && !selectedItemId}
                                className="w-full h-20 p-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <button 
                                onClick={handleAddComment}
                                disabled={!commentInput.trim()}
                                className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderRequestsContent = () => {
     // Reusing existing renderRequestsContent logic
     return (
        <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Requests</h1>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <div className="mb-6">
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Visa Type</p>
                 <p className="font-medium text-slate-900">Canada Express Entry</p>
               </div>
               <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Current Status</p>
                  <p className="font-medium text-slate-900">Reviewing submitted documents</p>
               </div>
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
             <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm mb-4">Request Progress</h4>
                <div className="space-y-0 relative">
                   <div className="absolute left-[7px] top-2 bottom-6 w-px bg-slate-200"></div>
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
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
             <Button>View request details</Button>
          </div>
        </div>
      </div>
     );
  };

  /* ----------------------------------------------------------------
     PAGE 1: /find — Visa Requirement Search
  ---------------------------------------------------------------- */
  const renderFindRequirements = () => {
    // 3. Filter available visa types from visa_routes
    const availableVisaTypeIds = visaRoutes
        .filter(r => r.origin_country_id === searchOriginId && r.destination_country_id === searchDestinationId && r.is_active)
        .map(r => r.visa_type_id);
    
    const availableVisaTypes = visaTypes.filter(vt => availableVisaTypeIds.includes(vt.id));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-16">
        <div className="mb-8">
           <button 
             onClick={() => setActiveView('checklists')} 
             className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4"
           >
             <ArrowRight className="rotate-180" size={14} /> Back to My Checklists
           </button>
           <h1 className="text-2xl font-bold text-slate-900">Visa Requirement Search</h1>
           <p className="text-slate-500 mt-1">Find official requirements based on where you’re traveling from and to.</p>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center gap-4 mb-10 text-sm font-medium">
           <div className="flex items-center gap-2 text-primary">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
              <span>Origin</span>
           </div>
           <div className="w-8 h-px bg-slate-200"></div>
           <div className={`flex items-center gap-2 ${searchOriginId ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${searchOriginId ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
              <span>Destination</span>
           </div>
           <div className="w-8 h-px bg-slate-200"></div>
           <div className={`flex items-center gap-2 ${searchDestinationId ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${searchDestinationId ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
              <span>Visa Type</span>
           </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a citizen of</label>
              <div className="relative">
                 <select 
                   value={searchOriginId}
                   onChange={(e) => { setSearchOriginId(e.target.value); setSearchDestinationId(''); setSelectedVisaTypeId(''); }}
                   className="w-full h-12 pl-4 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none"
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
                   value={searchDestinationId}
                   onChange={(e) => { setSearchDestinationId(e.target.value); setSelectedVisaTypeId(''); }}
                   disabled={!searchOriginId}
                   className="w-full h-12 pl-4 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                 >
                    <option value="" disabled>Select destination</option>
                    {countries.filter(c => c.id !== searchOriginId).map(c => (
                        <option key={c.id} value={c.id}>{c.theme_flag_emoji} {c.name}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
           </div>
        </div>

        {/* Results / Visa Types */}
        {searchOriginId && searchDestinationId && (
           <div className="animate-fade-in-up">
              {/* Info Banner Logic: Dummy implementation based on ID for demo */}
              <div className={`p-4 rounded-lg border mb-8 flex items-start gap-3 ${
                  searchOriginId === 'ca' 
                    ? 'bg-blue-50 border-blue-100' 
                    : 'bg-amber-50 border-amber-100'
              }`}>
                  {searchOriginId === 'ca' ? (
                     <Info className="text-accent shrink-0 mt-0.5" size={20} />
                  ) : (
                     <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
                  )}
                  <div>
                     <p className={`text-sm font-medium ${
                        searchOriginId === 'ca' ? 'text-blue-900' : 'text-amber-900'
                     }`}>
                        {searchOriginId === 'ca' 
                          ? "Canadian citizens generally do not require a visa for tourism to the United States."
                          : "A visa is required for Nigerian citizens traveling to the United States."}
                     </p>
                     
                     {/* Metadata in Banner (from dummy data, approximating last_verified_at from template logic) */}
                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] opacity-80">
                        <span className="flex items-center gap-1">
                           <ShieldCheck size={12} />
                           Source: {searchOriginId === 'ca' ? 'U.S. Department of State / CBP' : 'U.S. Department of State / Lagos Consulate'}
                        </span>
                        <span className="flex items-center gap-1">
                           <Clock size={12} />
                           Last verified: Jan {searchOriginId === 'ca' ? '10' : '12'}, 2026
                        </span>
                        <a href="#" className="underline hover:no-underline">View official source</a>
                     </div>
                  </div>
              </div>

              <h3 className="font-bold text-slate-900 mb-4">Select Visa Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                 {availableVisaTypes.length > 0 ? availableVisaTypes.map((visa) => (
                    <button
                       key={visa.id}
                       onClick={() => setSelectedVisaTypeId(visa.id)}
                       className={`p-4 rounded-xl border text-left transition-all ${
                          selectedVisaTypeId === visa.id 
                             ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-sm' 
                             : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                       }`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-900 text-sm">{visa.name}</span>
                          {selectedVisaTypeId === visa.id && <CheckCircle2 size={16} className="text-primary" />}
                       </div>
                       <p className="text-xs text-slate-500">{visa.description}</p>
                    </button>
                 )) : (
                     <p className="text-slate-500 text-sm col-span-3">No visa routes available for this selection in demo.</p>
                 )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                 <Button disabled={!selectedVisaTypeId} onClick={() => setActiveView('playbook')}>View playbook</Button>
                 <Button variant="outline" disabled={true} title="Select a visa first">Save as checklist</Button>
              </div>
           </div>
        )}
      </div>
    );
  };

  /* ----------------------------------------------------------------
     PAGE 2: /playbook/[country]/[visa] — Full Playbook
  ---------------------------------------------------------------- */
  const renderPlaybook = () => {
    const data = getPlaybookData();
    if (!data) return <div className="p-8 text-center text-slate-500">Loading playbook...</div>;

    const { template, items, sections, meta, assets: playbookAssets, visa_type, country } = data;

    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-16">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button onClick={() => setActiveView('find')} className="hover:text-slate-900">Find Requirements</button>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium">Playbook</span>
         </div>

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{template.title}</h1>
               </div>
               <p className="text-slate-600 mb-4">{template.summary}</p>
               
               <div className="flex flex-wrap gap-3 items-center text-xs">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${
                      template.status === 'published' ? 'bg-green-50 text-success border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                     <ShieldCheck size={12} />
                     {template.status === 'published' ? 'Official-sourced' : 'Draft'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                     <Database size={12} />
                     {template.version}
                  </span>
                  
                  {template.supersedes_template_id && (
                       <span className="text-slate-400 flex items-center gap-1">
                           <History size={12} /> Supersedes previous version
                       </span>
                  )}
               </div>
               
               {/* Change Summary Collapsible */}
               {template.change_summary && (
                   <div className="mt-4">
                       <button 
                         onClick={() => setIsChangeSummaryOpen(!isChangeSummaryOpen)}
                         className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
                       >
                           {isChangeSummaryOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                           What changed in this version?
                       </button>
                       {isChangeSummaryOpen && (
                           <div className="mt-2 p-3 bg-blue-50/50 rounded-lg text-xs text-slate-700 border border-blue-100">
                               {template.change_summary}
                           </div>
                       )}
                   </div>
               )}
            </div>
            
            <div className="flex gap-3 shrink-0">
               <Button variant="secondary" onClick={() => setActiveView('marketplace')}>Find assistance</Button>
               <Button onClick={() => setActiveView('checklist-preview')}>Build checklist</Button>
            </div>
         </div>

         {/* Detailed Meta Panel (Mapped to requirement_templates fields) */}
         <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-10 flex flex-wrap gap-x-8 gap-y-4 text-xs">
              <div>
                  <span className="block text-slate-400 mb-1">Source Authority</span>
                  <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-slate-900 hover:text-primary">
                      {template.source_org} <ExternalLink size={10} />
                  </a>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Published</span>
                  <span className="font-medium text-slate-900">{template.published_at}</span>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Last Verified</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1">
                      {template.last_verified_at} <CheckCircle2 size={10} className="text-success" />
                  </span>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Revision Date</span>
                  <span className="font-medium text-slate-900">{template.revision_date}</span>
              </div>
         </div>

         {/* Playbook Meta Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Processing Time</p>
                <p className="font-semibold text-slate-900 text-sm">{meta.processing_time_text}</p>
             </div>
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Typical Costs</p>
                <p className="font-semibold text-slate-900 text-sm">{meta.typical_cost_text}</p>
             </div>
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm col-span-2">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-xs text-slate-500">Meta Updated</p>
                </div>
                <p className="font-medium text-slate-900 text-xs">{meta.updated_at}</p>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Requirements List */}
            <div className="lg:col-span-2">
               <h3 className="font-bold text-slate-900 mb-4 text-lg">Requirements Checklist</h3>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {items.map((item) => (
                     <div key={item.id} className="p-4 border-b border-slate-100 last:border-0 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                           {/* Empty circle for template view */}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 text-sm">{item.label}</span>
                              {item.required ? (
                                 <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">Required</span>
                              ) : (
                                 <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded font-medium uppercase tracking-wide border border-slate-100">Conditional</span>
                              )}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="bg-slate-50 px-1.5 rounded border border-slate-100">{item.category}</span>
                              {item.notes_hint && (
                                  <>
                                    <span>•</span>
                                    <span>{item.notes_hint}</span>
                                  </>
                              )}
                           </div>
                           {/* client_key present in data but hidden in UI as per standard practice unless debug mode */}
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="mt-8">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Common Refusal Reasons</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                     {meta.refusal_reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Right Col: Guide & Assets */}
            <div className="space-y-8">
               
               {/* Assets Box */}
               <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Official Assets</h3>
                      {playbookAssets.length > 0 && <span className="text-[10px] text-slate-400">Assets updated</span>}
                  </div>
                  <div className="space-y-3">
                     {playbookAssets.filter(a => a.is_active).sort((a,b) => a.sort_order - b.sort_order).map((asset) => (
                        <a key={asset.id} href={asset.external_url || asset.file_path} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group">
                           {asset.asset_type === 'pdf' ? <Download size={18} className="text-slate-400 group-hover:text-primary" /> : <ExternalLink size={18} className="text-slate-400 group-hover:text-primary" />}
                           <div>
                               <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 block">{asset.title}</span>
                               <span className="text-xs text-slate-400">{asset.description}</span>
                           </div>
                        </a>
                     ))}
                  </div>
               </div>

               {/* Guide Accordion */}
               <div>
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Playbook Guide</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                     {sections.filter(s => s.is_active).sort((a,b) => a.sort_order - b.sort_order).map((section) => (
                        <div key={section.id} className="bg-white">
                           <button 
                              onClick={() => setExpandedSection(expandedSection === section.section_key ? null : section.section_key)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                           >
                              <span className="font-medium text-slate-900 text-sm">{section.title}</span>
                              {expandedSection === section.section_key ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                           </button>
                           {expandedSection === section.section_key && (
                              <div className="px-4 pb-4 bg-slate-50/50">
                                 <p className="text-sm text-slate-600 leading-relaxed mb-2">{section.content_json}</p>
                                 <p className="text-[10px] text-slate-400 text-right">Section updated: {section.updated_at}</p>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </div>
    );
  };

  /* ----------------------------------------------------------------
     PAGE 3: /checklist — Personal Checklist Creation (Preview)
  ---------------------------------------------------------------- */
  const renderChecklistCreation = () => {
    const data = getPlaybookData();
    if (!data) return <div>Loading...</div>;

    const { template, items, country, visa_type } = data;

    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-16">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button onClick={() => setActiveView('playbook')} className="hover:text-slate-900">Playbook</button>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium">Create Checklist</span>
         </div>

         {/* Header mapped to requirement_templates */}
         <div className="flex items-start justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Checklist: {template.title}</h1>
               <div className="flex flex-col gap-1 text-sm text-slate-600">
                   <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                         <Database size={12} /> {template.version} ({template.revision_date})
                      </span>
                      <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline text-xs font-medium">
                         <ExternalLink size={12} /> Official source: {template.source_org}
                      </a>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs mt-1">
                      <Clock size={12} className="text-slate-400" /> 
                      Last verified: <span className="font-medium text-slate-900">{template.last_verified_at}</span>
                   </div>
               </div>
               
               {/* Change Summary Collapsible in Header */}
               {template.change_summary && (
                   <div className="mt-3">
                       <div className="text-xs p-2 bg-amber-50 text-amber-900 rounded border border-amber-100 inline-block">
                           <span className="font-bold">What changed:</span> {template.change_summary}
                       </div>
                   </div>
               )}
            </div>
            
            <Button variant="secondary" size="sm" onClick={() => setActiveView('marketplace')}>Find assistance</Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               {/* Checklist Table */}
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                     <div className="col-span-6">Requirement</div>
                     <div className="col-span-3">Status</div>
                     <div className="col-span-3 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                     {items.map((item) => (
                        <div key={item.id} className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors">
                           <div className="col-span-6">
                              <p className="font-medium text-slate-900 text-sm mb-0.5">{item.label}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                 {item.required && <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 rounded">REQUIRED</span>}
                                 <span className="text-[10px] text-slate-400">{item.category}</span>
                              </div>
                              {item.notes_hint && <p className="text-[10px] text-slate-400 mt-1 italic">{item.notes_hint}</p>}
                           </div>
                           <div className="col-span-3">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                 To Do
                              </span>
                           </div>
                           <div className="col-span-3 text-right">
                              <button className="text-xs font-medium text-primary hover:text-slate-800 transition-colors">
                                 Upload
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Notes Field */}
               <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Personal Notes</label>
                  <textarea 
                     className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                     placeholder="Add any specific details about your case here..."
                  ></textarea>
               </div>
            </div>

            {/* Sidebar Help */}
            <div className="space-y-6">
               <div className="bg-primary text-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Ready to start?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                     By creating this checklist, you can track your progress, upload documents securely, and get alerts if requirements change.
                  </p>
                  <Button className="w-full bg-white text-primary hover:bg-slate-100 border-0" onClick={handleCreateChecklist}>
                     Create Checklist
                  </Button>
               </div>

               <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">Need professional help?</h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                     Verified experts can review your documents before you submit.
                  </p>
                  <Button variant="outline" className="w-full bg-white" onClick={() => setActiveView('marketplace')}>Find Verified Expert</Button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <DashboardLayout 
      userType="Applicant" 
      userName="Sarah Jenkins" 
      sidebarItems={sidebarItems}
      onLogout={onLogout}
    >
      {activeView === 'dashboard' && renderDashboardContent()}
      {activeView === 'checklists' && renderChecklistsContent()}
      {activeView === 'requests' && renderRequestsContent()}
      
      {/* New Views */}
      {activeView === 'find' && renderFindRequirements()}
      {activeView === 'playbook' && renderPlaybook()}
      {activeView === 'checklist-preview' && renderChecklistCreation()}

      {(activeView === 'marketplace' || activeView === 'notifications' || activeView === 'settings') && (
        <div className="text-center py-20 text-slate-400">
          <p>This view is not part of the current design task.</p>
          <Button variant="ghost" className="mt-4" onClick={() => setActiveView('dashboard')}>Return to Dashboard</Button>
        </div>
      )}
    </DashboardLayout>
  );
};