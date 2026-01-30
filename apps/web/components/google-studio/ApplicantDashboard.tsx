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
  Map as MapIcon,
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
  ChevronUp,
  Info,
  AlertTriangle,
  Database,
  History,
  MessageSquare,
  Upload,
  Paperclip,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';
import { supabase } from '@/lib/supabaseClient';

interface ApplicantDashboardProps {
  onLogout: () => void;
  userName?: string;
  startInChecklists?: boolean;
  prefill?: {
    originCountrySlug: string;
    destinationCountrySlug: string;
    visaTypeSlug: string;
  } | null;
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
  last_verified_at?: string;
  change_summary?: string;
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
  is_active?: boolean;
  updated_at?: string;
}

interface PlaybookMeta {
  id: string;
  country_id: string;
  visa_type_id: string;
  processing_time_text?: string;
  typical_cost_text?: string;
  refusal_reasons: string[];
  updated_at?: string;
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
  is_active?: boolean;
}

interface ChecklistItemRow {
  id: string;
  checklist_id: string;
  label: string;
  required: boolean;
  status: "todo" | "uploaded" | "verified";
  category?: string | null;
  notes?: string | null;
  sort_order?: number | null;
  client_key?: string | null;
  uploads?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    content_type?: string;
    size_bytes?: number;
    created_at?: string;
  }>;
}

interface ChecklistSummary {
  id: string;
  template_id: string | null;
  title: string;
  destination_country: string;
  visa_type_name: string;
  version: string;
  revision_date: string | null;
  created_at: string | null;
  last_updated: string | null;
  progress: number;
  items: ChecklistItemRow[];
  source_org: string | null;
  source_url: string | null;
  country_id: string | null;
  visa_type_id: string | null;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  type: "general" | "item";
  itemId?: string;
  user_id?: string;
  created_at?: string;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  onLogout,
  userName = "User",
  startInChecklists = false,
  prefill = null,
}) => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');

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
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [prefillVisaSlug, setPrefillVisaSlug] = useState<string | null>(null);
  const [autoOpenedFind, setAutoOpenedFind] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [myChecklists, setMyChecklists] = useState<ChecklistSummary[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

  // User is "new" if they have no active checklists
  const isNewUser = myChecklists.length === 0;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; checklistId: string | null }>({
    open: false,
    checklistId: null,
  });
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; checklistId: string | null }>({
    open: false,
    checklistId: null,
  });
  const [commentModal, setCommentModal] = useState<{ open: boolean; itemId: string | null; itemLabel: string | null }>({
    open: false,
    itemId: null,
    itemLabel: null,
  });
  const [uploadModal, setUploadModal] = useState<{ open: boolean; itemId: string | null; itemLabel: string | null }>({
    open: false,
    itemId: null,
    itemLabel: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

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

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? null);
    };
    loadSession();
  }, []);

  const showToast = (message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Prefill origin/destination from query params (if provided)
  useEffect(() => {
    if (!prefill || prefillApplied || countries.length === 0) return;

    const origin = countries.find((c) => c.slug === prefill.originCountrySlug) || null;
    const destination = countries.find((c) => c.slug === prefill.destinationCountrySlug) || null;

    if (origin) setSelectedOriginCountry(origin);
    if (destination) setSelectedCountry(destination);
    setSelectedVisaType(null);
    setPrefillVisaSlug(prefill.visaTypeSlug);
    setPrefillApplied(true);

    if (startInChecklists) {
      setActiveView('checklists');
    }
  }, [prefill, prefillApplied, countries, startInChecklists]);

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

  // Prefill visa type after visa types are loaded
  useEffect(() => {
    if (!prefillVisaSlug || visaTypes.length === 0) return;
    const visa = visaTypes.find((v) => v.slug === prefillVisaSlug) || null;
    if (visa) setSelectedVisaType(visa);
  }, [prefillVisaSlug, visaTypes]);

  // Auto-open Build Checklist view once selections are available
  useEffect(() => {
    if (!startInChecklists || autoOpenedFind) return;
    if (selectedOriginCountry && selectedCountry) {
      setActiveView('find');
      setAutoOpenedFind(true);
    }
  }, [startInChecklists, autoOpenedFind, selectedOriginCountry, selectedCountry]);

  // Auto-open Build Checklist when no prefill is provided
  useEffect(() => {
    if (!startInChecklists || autoOpenedFind || prefill) return;
    setActiveView('find');
    setAutoOpenedFind(true);
  }, [startInChecklists, autoOpenedFind, prefill]);

  const formatDateShort = (iso?: string | null) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const computeProgress = (items: ChecklistItemRow[]) => {
    const requiredItems = items.filter((i) => i.required);
    if (requiredItems.length === 0) return 0;
    const completed = requiredItems.filter((i) => i.status !== "todo").length;
    return Math.round((completed / requiredItems.length) * 100);
  };

  const loadChecklists = async (selectChecklistId?: string) => {
    if (!userId) {
      console.log('loadChecklists: userId is null, skipping');
      return;
    }
    console.log('loadChecklists: Loading checklists for userId:', userId);
    setChecklistsLoading(true);

    const { data: checklists, error } = await supabase
      .from("checklists")
      .select(
        "id,title,country,visa,created_at,updated_at,completed_at,template_id,template_version_used,template_revision_date_used,template_published_at_used,country_id,visa_type_id"
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .order("created_at", { ascending: false });

    console.log('loadChecklists: Query result:', { checklists, error });

    if (error) {
      console.error('loadChecklists: Error loading checklists:', error);
      showToast("Failed to load checklists.", "error");
      setMyChecklists([]);
      setChecklistsLoading(false);
      return;
    }
    if (!checklists || checklists.length === 0) {
      console.log('loadChecklists: No checklists found');
      setMyChecklists([]);
      setChecklistsLoading(false);
      return;
    }

    const countryIds = Array.from(
      new Set(checklists.map((c: any) => c.country_id).filter(Boolean))
    );
    const visaTypeIds = Array.from(
      new Set(checklists.map((c: any) => c.visa_type_id).filter(Boolean))
    );
    const templateIds = Array.from(
      new Set(checklists.map((c: any) => c.template_id).filter(Boolean))
    );

    const [{ data: countryRows }, { data: visaRows }, { data: templateRows }] = await Promise.all([
      countryIds.length
        ? supabase.from("countries").select("id,name").in("id", countryIds)
        : Promise.resolve({ data: [] }),
      visaTypeIds.length
        ? supabase.from("visa_types").select("id,name").in("id", visaTypeIds)
        : Promise.resolve({ data: [] }),
      templateIds.length
        ? supabase
            .from("requirement_templates")
            .select("id,version,source_url,source_org,revision_date")
            .in("id", templateIds)
        : Promise.resolve({ data: [] }),
    ]);

    const countryMap = new Map((countryRows ?? []).map((r: any) => [r.id, r.name]));
    const visaMap = new Map((visaRows ?? []).map((r: any) => [r.id, r.name]));
    const templateMap = new Map((templateRows ?? []).map((r: any) => [r.id, r]));

    const ids = checklists.map((c: any) => c.id);
    const { data: itemsData } = await supabase
      .from("checklist_items")
      .select("id,checklist_id,label,required,status,category,notes,sort_order,client_key")
      .in("checklist_id", ids)
      .order("sort_order", { ascending: true });

    // Fetch uploads for all items
    const itemIds = (itemsData ?? []).map((item: any) => item.id);
    const { data: uploadsData } = itemIds.length > 0
      ? await supabase
          .from("checklist_uploads")
          .select("id,checklist_item_id,file_name,file_path,content_type,size_bytes,created_at")
          .in("checklist_item_id", itemIds)
      : { data: [] };

    // Group uploads by item ID
    const uploadsMap = new Map<string, any[]>();
    (uploadsData ?? []).forEach((upload: any) => {
      const list = uploadsMap.get(upload.checklist_item_id) ?? [];
      list.push(upload);
      uploadsMap.set(upload.checklist_item_id, list);
    });

    const grouped = new Map<string, ChecklistItemRow[]>();
    (itemsData ?? []).forEach((row: any) => {
      const list = grouped.get(row.checklist_id) ?? [];
      list.push({
        id: row.id,
        checklist_id: row.checklist_id,
        label: row.label,
        required: !!row.required,
        status: (row.status as ChecklistItemRow["status"]) ?? "todo",
        category: row.category ?? null,
        notes: row.notes ?? "",
        sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
        client_key: row.client_key ?? null,
        uploads: uploadsMap.get(row.id) ?? [],
      });
      grouped.set(row.checklist_id, list);
    });

    const summaries: ChecklistSummary[] = (checklists ?? []).map((c: any) => {
      const template = c.template_id ? templateMap.get(c.template_id) : null;
      const versionNum = template?.version ?? c.template_version_used ?? 1;
      const versionLabel = typeof versionNum === "number" ? `v${versionNum}.0` : String(versionNum);
      const items = grouped.get(c.id) ?? [];
      const destinationName = countryMap.get(c.country_id) ?? c.country ?? "Unknown";
      const visaName = visaMap.get(c.visa_type_id) ?? c.visa ?? "Visa";
      return {
        id: c.id,
        template_id: c.template_id ?? null,
        title: c.title ?? `${visaName} - ${destinationName}`,
        destination_country: destinationName,
        visa_type_name: visaName,
        version: versionLabel,
        revision_date: template?.revision_date ?? c.template_revision_date_used ?? null,
        created_at: c.created_at ?? null,
        last_updated: c.updated_at ?? null,
        progress: computeProgress(items),
        items,
        source_org: template?.source_org ?? null,
        source_url: template?.source_url ?? null,
        country_id: c.country_id ?? null,
        visa_type_id: c.visa_type_id ?? null,
      };
    });

    console.log('loadChecklists: Loaded summaries:', summaries.length, 'checklists');
    setMyChecklists(summaries);

    // If a specific checklist ID was requested, select it
    if (selectChecklistId) {
      console.log('loadChecklists: Selecting specific checklist:', selectChecklistId);
      setSelectedChecklistId(selectChecklistId);
    } else if (!selectedChecklistId && summaries.length > 0) {
      console.log('loadChecklists: Selecting first checklist:', summaries[0].id);
      setSelectedChecklistId(summaries[0].id);
    }
    setChecklistsLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    loadChecklists();
  }, [userId]);

  useEffect(() => {
    if (myChecklists.length === 0) return;
    if (!selectedChecklistId || !myChecklists.find((c) => c.id === selectedChecklistId)) {
      setSelectedChecklistId(myChecklists[0].id);
    }
  }, [myChecklists, selectedChecklistId]);

  // Load comments when comment modal opens
  useEffect(() => {
    if (commentModal.open && commentModal.itemId) {
      loadComments(commentModal.itemId);
    }
  }, [commentModal.open, commentModal.itemId]);

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
    if (!userId) {
      showToast("Please sign in to create a checklist.", "error");
      return;
    }
    console.log('handleCreateChecklist: Starting checklist creation', {
      userId,
      country: selectedCountry.name,
      visaType: selectedVisaType.name,
      templateId: template.id
    });
    setCreatingChecklist(true);

    // Check if an active checklist already exists for this path
    const { data: existingActive } = await supabase
      .from('checklists')
      .select('id')
      .eq('user_id', userId)
      .eq('country', selectedCountry.slug)
      .eq('visa', selectedVisaType.slug)
      .is('completed_at', null)
      .maybeSingle();

    if (existingActive) {
      console.log('handleCreateChecklist: Active checklist already exists, navigating to it:', existingActive.id);
      setSelectedChecklistId(existingActive.id);
      setActiveView('checklists');
      setCreatingChecklist(false);
      showToast("You already have an active checklist for this visa path.", "error");
      return;
    }

    // Insert new checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert([
        {
          country: selectedCountry.slug,
          visa: selectedVisaType.slug,
          title: `Checklist • ${selectedCountry.name} • ${selectedVisaType.name}`,
          user_id: userId,
          country_id: selectedCountry.id,
          visa_type_id: selectedVisaType.id,
          template_id: template.id,
        },
      ])
      .select("id,template_version_used")
      .single();
    if (checklistError || !checklist) {
      console.error('handleCreateChecklist: Failed to create checklist:', checklistError);
      setCreatingChecklist(false);
      showToast("Failed to create checklist.", "error");
      return;
    }

    console.log('handleCreateChecklist: Checklist created successfully:', checklist.id);

    if (!checklist.template_version_used && template.version) {
      await supabase
        .from("checklists")
        .update({
          template_version_used: template.version,
          template_revision_date_used: template.revision_date ?? null,
          template_published_at_used: template.published_at ?? null,
        })
        .eq("id", checklist.id);
    }

    // Seed missing checklist items from template (avoid duplicates)
    const { data: existingItems } = await supabase
      .from("checklist_items")
      .select("client_key")
      .eq("checklist_id", checklist.id);

    const existingKeys = new Set((existingItems ?? []).map((row: any) => row.client_key));
    const itemsToInsert = templateItems
      .map((item, idx) => ({
        checklist_id: checklist.id,
        user_id: userId,
        label: item.label,
        required: item.required,
        status: "todo",
        category: item.category ?? "Documents",
        sort_order: typeof item.sort_order === "number" ? item.sort_order : idx,
        client_key: item.client_key ?? `tmpl_${item.id ?? idx}`,
        notes: item.notes_hint ?? "",
        template_item_id: item.id,
      }))
      .filter((item) => !existingKeys.has(item.client_key));

    console.log('handleCreateChecklist: Inserting', itemsToInsert.length, 'items');
    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from("checklist_items").insert(itemsToInsert);
      if (itemsError) {
        console.error('handleCreateChecklist: Error inserting items:', itemsError);
      } else {
        console.log('handleCreateChecklist: Items inserted successfully');
      }
    }

    // Reload checklists and select the newly created one
    console.log('handleCreateChecklist: Reloading checklists and selecting:', checklist.id);
    await loadChecklists(checklist.id);

    // Clear the selection state and navigate to checklists view
    console.log('handleCreateChecklist: Navigating to checklists view');
    setActiveView('checklists');
    setSelectedOriginCountry(null);
    setSelectedCountry(null);
    setSelectedVisaType(null);
    setCreatingChecklist(false);

    showToast("Checklist ready.", "success");
  };

  const handleItemStatusChange = async (
    checklistId: string,
    itemId: string,
    status: "To Do" | "Uploaded" | "Verified"
  ) => {
    const mapped: "todo" | "uploaded" | "verified" = status === "To Do" ? "todo" : status === "Uploaded" ? "uploaded" : "verified";
    const { error } = await supabase
      .from("checklist_items")
      .update({ status: mapped })
      .eq("id", itemId)
      .eq("checklist_id", checklistId);

    if (error) {
      showToast("Failed to update item status.", "error");
      return;
    }

    setMyChecklists((prev) =>
      prev.map((cl) => {
        if (cl.id !== checklistId) return cl;
        const updatedItems = cl.items.map((it) =>
          it.id === itemId ? { ...it, status: mapped } : it
        );
        return { ...cl, items: updatedItems, progress: computeProgress(updatedItems) };
      })
    );
  };

  const openDeleteDialog = (checklistId: string) => {
    setDeleteDialog({ open: true, checklistId });
  };

  const confirmDeleteChecklist = async () => {
    if (!deleteDialog.checklistId) return;
    const checklistId = deleteDialog.checklistId;
    setDeleteDialog({ open: false, checklistId: null });

    const { error: itemsError } = await supabase
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId);
    if (itemsError) {
      showToast("Failed to delete checklist items.", "error");
      return;
    }

    const { error } = await supabase.from("checklists").delete().eq("id", checklistId);
    if (error) {
      showToast("Failed to delete checklist.", "error");
      return;
    }

    setMyChecklists((prev) => prev.filter((c) => c.id !== checklistId));
    if (selectedChecklistId === checklistId) {
      const next = myChecklists.find((c) => c.id !== checklistId);
      setSelectedChecklistId(next?.id ?? null);
    }
    showToast("Checklist deleted.", "success");
  };

  const openCompleteDialog = (checklistId: string) => {
    setCompleteDialog({ open: true, checklistId });
  };

  const confirmCompleteChecklist = async () => {
    if (!completeDialog.checklistId) return;
    const checklistId = completeDialog.checklistId;
    setCompleteDialog({ open: false, checklistId: null });

    const { error } = await supabase
      .from("checklists")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", checklistId);

    if (error) {
      showToast("Failed to mark checklist as completed.", "error");
      return;
    }

    setMyChecklists((prev) => prev.filter((c) => c.id !== checklistId));
    if (selectedChecklistId === checklistId) {
      const next = myChecklists.find((c) => c.id !== checklistId);
      setSelectedChecklistId(next?.id ?? null);
    }
    showToast("Checklist marked as completed.", "success");
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    if (!commentModal.itemId) return;
    if (!userId) return;

    // Save to database
    const { data, error } = await supabase
      .from("checklist_item_comments")
      .insert([
        {
          checklist_item_id: commentModal.itemId,
          user_id: userId,
          comment_text: commentInput.trim(),
        },
      ])
      .select("id, comment_text, created_at")
      .single();

    if (error) {
      showToast("Failed to add comment.", "error");
      return;
    }

    // Add to local state for immediate UI update
    const newComment: Comment = {
      id: data.id,
      author: userName || "You",
      text: data.comment_text,
      timestamp: new Date(data.created_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      type: "item",
      itemId: commentModal.itemId,
      user_id: userId,
      created_at: data.created_at,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput("");
    showToast("Comment added.", "success");
  };

  const loadComments = async (itemId: string) => {
    const { data, error } = await supabase
      .from("checklist_item_comments")
      .select("id, comment_text, created_at, user_id")
      .eq("checklist_item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load comments:", error);
      return;
    }

    const loadedComments: Comment[] = (data || []).map((c: any) => ({
      id: c.id,
      author: c.user_id === userId ? userName || "You" : "User",
      text: c.comment_text,
      timestamp: new Date(c.created_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      type: "item" as const,
      itemId: itemId,
      user_id: c.user_id,
      created_at: c.created_at,
    }));

    setComments(loadedComments);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadModal.itemId || !userId) return;

    setUploading(true);

    try {
      // Create unique file path: userId/checklistItemId/timestamp-filename
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${timestamp}-${selectedFile.name}`;
      const filePath = `${userId}/${uploadModal.itemId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('checklist-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Save record to checklist_uploads table
      const { error: dbError } = await supabase
        .from('checklist_uploads')
        .insert([
          {
            checklist_item_id: uploadModal.itemId,
            user_id: userId,
            file_path: uploadData.path,
            file_name: selectedFile.name,
            content_type: selectedFile.type,
            size_bytes: selectedFile.size,
          },
        ]);

      if (dbError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('checklist-documents').remove([filePath]);
        throw dbError;
      }

      showToast("File uploaded successfully.", "success");
      setUploadModal({ open: false, itemId: null, itemLabel: null });
      setSelectedFile(null);

      // Reload the checklist to show the new upload
      await loadChecklists();
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload file.", "error");
    } finally {
      setUploading(false);
    }
  };

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: activeView === 'dashboard', onClick: () => setActiveView('dashboard') },
    { icon: <CheckSquare size={18} />, label: "My Checklists", active: ['checklists', 'find', 'playbook', 'checklist-preview'].includes(activeView), onClick: () => setActiveView('checklists') },
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

    // Calculate summary metrics
    const totalActiveChecklists = myChecklists.length;
    const checklistsNeedingAttention = myChecklists.filter(c => c.progress > 0 && c.progress < 100).length;

    return (
      <>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h1>
            <p className="text-slate-500 mt-1">Here's the current status of your visa applications.</p>
          </div>

          {/* Top Summary Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Card A - Active Checklists */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckSquare size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Checklists</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {totalActiveChecklists} <span className="text-sm font-normal text-slate-500">active</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    {checklistsNeedingAttention} needs attention · {totalActiveChecklists - checklistsNeedingAttention} on track
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('checklists')}
                className="text-sm text-primary hover:text-slate-900 font-medium flex items-center gap-1 group"
              >
                View checklists
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Card B - Requirements Updates (Placeholder) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="absolute top-4 right-4 w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requirements Updates</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    1 <span className="text-sm font-normal text-slate-500">update available</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Most recent revision: Jan 10, 2026
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('checklists')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 group"
              >
                Review updates
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Card C - Expert Assistance (Placeholder) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expert Assistance</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    1 <span className="text-sm font-normal text-slate-500">ongoing request</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Assigned to a verified agent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('requests')}
                className="text-sm text-primary hover:text-slate-900 font-medium flex items-center gap-1 group"
              >
                View request
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

          {/* Section: My Active Checklists */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">My Active Checklists</h2>
            </div>
            {myChecklists.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-12 text-center text-slate-500">
                <CheckSquare size={32} className="mx-auto mb-3 text-slate-300" />
                <p>No active checklists yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                  {myChecklists.map((checklist, index) => {
                    // Get country code from destination (first 2 letters uppercase)
                    const countryCode = checklist.destination_country.substring(0, 2).toUpperCase();
                    // Determine if update is available (placeholder logic - can be enhanced)
                    const hasUpdate = index === 0; // Example: first checklist has update

                    return (
                      <div key={checklist.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-start gap-4">
                          {/* Country Code */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-700">{countryCode}</span>
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-0.5">{checklist.destination_country}</h3>
                                <p className="text-sm text-slate-600">{checklist.visa_type_name}</p>
                              </div>
                              {hasUpdate ? (
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-md text-xs font-semibold text-amber-700 flex-shrink-0">
                                  <AlertTriangle size={12} />
                                  Update available
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md text-xs font-semibold text-success flex-shrink-0">
                                  <CheckCircle2 size={12} />
                                  Current
                                </span>
                              )}
                            </div>

                            {/* Progress */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                                <span>Progress</span>
                                <span>{Math.round(checklist.progress)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${hasUpdate ? 'bg-amber-500' : 'bg-success'}`}
                                  style={{ width: `${checklist.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Meta Info Row */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                              <div className="flex items-center gap-1.5">
                                <Database size={12} />
                                <span>v{checklist.version}</span>
                                {checklist.revision_date && (
                                  <span>· Revised {new Date(checklist.revision_date).toLocaleDateString()}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                <span>{checklist.last_updated ? (() => {
                                  const lastUpdate = new Date(checklist.last_updated);
                                  const now = new Date();
                                  const diffMs = now.getTime() - lastUpdate.getTime();
                                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                  if (diffDays === 0) return 'Today';
                                  if (diffDays === 1) return 'Yesterday';
                                  if (diffDays < 7) return `${diffDays} days ago`;
                                  return lastUpdate.toLocaleDateString();
                                })() : 'N/A'}</span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setActiveView('checklist-preview');
                                setSelectedChecklistId(checklist.id);
                              }}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Section: Ongoing Request (Placeholder) */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Ongoing Request</h2>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {/* Agent Info */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                    <UserCheck size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-base font-bold text-slate-900">Marcus Thorne</p>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-success text-xs font-semibold">
                        <CheckCircle2 size={12} />
                        <span>Verified Agent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="font-semibold text-slate-700">NG</span>
                  <span className="text-slate-900">Nigeria</span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">US</span>
                  <span className="text-slate-900">United States</span>
                </div>
                <p className="text-sm text-slate-600">Tourist / Visit (B-2)</p>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">In progress</span>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-slate-900">Request submitted</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-slate-900">Documents uploaded</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                    </div>
                    <p className="text-sm font-medium text-slate-900">Reviewing documents</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex-shrink-0"></div>
                    <p className="text-sm text-slate-400">Feedback pending</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Documents</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-slate-900">Passport.pdf</span>
                    </div>
                    <span className="text-xs text-success font-medium">Received</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-slate-900">Bank_Statement.pdf</span>
                    </div>
                    <span className="text-xs text-success font-medium">Received</span>
                  </div>
                  <div className="flex items-center justify-between text-sm opacity-50">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-slate-600">Photo_ID.jpg</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Pending</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setActiveView('requests')}>
                  View Request
                </Button>
                <Button variant="secondary" className="flex-1">
                  Upload
                </Button>
              </div>
            </div>
          </div>
      </>
    );
  };

  const renderChecklistsContent = () => {
    if (checklistsLoading) {
      return (
        <div className="flex items-center justify-center py-16 text-slate-500">
          Loading checklists...
        </div>
      );
    }

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

    const activeChecklist = myChecklists.find(cl => cl.id === selectedChecklistId) || myChecklists[0];

    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
        <div className="flex gap-4 items-center pb-6 mb-2 border-b border-slate-200">
          <Button size="sm" variant="outline" className="shrink-0 gap-2 border-dashed" onClick={() => setActiveView('find')}>
            <Plus size={16} /> New Checklist
          </Button>

          {/* Checklist Dropdown Selector */}
          <div className="relative flex-1 max-w-md">
            <select
              value={selectedChecklistId || ''}
              onChange={(e) => setSelectedChecklistId(e.target.value)}
              className="w-full appearance-none bg-slate-900 text-white border border-slate-900 rounded-lg px-4 py-2 pr-10 text-sm font-bold shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {myChecklists.map(cl => (
                <option key={cl.id} value={cl.id}>
                  {cl.title} • {cl.progress}% complete
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white" size={16} />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
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
                    <Clock size={12} /> Last updated: {formatDateShort(activeChecklist.last_updated)}
                  </span>
                  {activeChecklist.source_url && (
                    <a href={activeChecklist.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <ExternalLink size={12} /> {activeChecklist.source_org || 'Source'}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => showToast("Export feature coming soon.", "error")}>Export</Button>
                <Button size="sm" onClick={() => openCompleteDialog(activeChecklist.id)}>Mark As Completed</Button>
                <button
                  onClick={() => openDeleteDialog(activeChecklist.id)}
                  className="p-2 rounded border border-red-200 text-red-600 hover:bg-red-50"
                  title="Delete checklist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="h-1 w-full bg-slate-100">
              <div className="h-full bg-success transition-all duration-500" style={{ width: `${activeChecklist.progress}%` }}></div>
            </div>

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
                  {activeChecklist.items.map(item => {
                    const statusLabel =
                      item.status === 'verified' ? 'Verified' : item.status === 'uploaded' ? 'Uploaded' : 'To Do';
                    return (
                      <tr
                        key={item.id}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                              item.status === 'verified' ? 'bg-success border-success text-white' :
                              item.status === 'uploaded' ? 'bg-primary border-primary text-white' :
                              'border-slate-300'
                            }`}>
                              {item.status === 'verified' && <Check size={10} strokeWidth={4} />}
                              {item.status === 'uploaded' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <div>
                              <p className={`text-sm font-medium mb-1 ${item.status === 'verified' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                {item.label}
                              </p>
                              <div className="flex items-center gap-2">
                                {item.required && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">REQUIRED</span>}
                                <span className="text-[10px] text-slate-400">{item.category ?? 'Documents'}</span>
                              </div>
                              {item.notes && <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <select
                            value={statusLabel}
                            onChange={(e) => handleItemStatusChange(activeChecklist.id, item.id, e.target.value as any)}
                            className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${
                              item.status === 'verified' ? 'bg-green-50 text-success border-green-200' :
                              item.status === 'uploaded' ? 'bg-blue-50 text-primary border-blue-200' :
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
                          {item.uploads && item.uploads.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {item.uploads.map((upload) => (
                                <button
                                  key={upload.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const { data } = await supabase.storage
                                        .from('checklist-documents')
                                        .createSignedUrl(upload.file_path, 3600);
                                      if (data?.signedUrl) {
                                        window.open(data.signedUrl, '_blank');
                                      }
                                    } catch (error) {
                                      showToast("Failed to open file.", "error");
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-xs text-primary hover:text-slate-800 hover:underline text-left"
                                >
                                  <Paperclip size={12} />
                                  <span className="truncate max-w-[120px]">{upload.file_name}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No files</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="flex justify-end gap-1">
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded"
                              title="Upload Document"
                              onClick={(e) => { e.stopPropagation(); setUploadModal({ open: true, itemId: item.id, itemLabel: item.label }); }}
                            >
                              <Upload size={16} />
                            </button>
                            <button
                              className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              title="Comments"
                              onClick={(e) => { e.stopPropagation(); setCommentModal({ open: true, itemId: item.id, itemLabel: item.label }); }}
                            >
                              <MessageSquare size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                    ? `No visa routes found for ${selectedOriginCountry.name} â†’ ${selectedCountry.name}. Please check back later.`
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
    const versionLabel = template?.version ? `v${template.version}.0` : 'v1.0';
    const existingChecklist = myChecklists.find(
      (c) => c.country_id === selectedCountry.id && c.visa_type_id === selectedVisaType.id
    );

    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-16">
         <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button onClick={() => setActiveView('find')} className="hover:text-slate-900">Find Requirements</button>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium">Playbook</span>
         </div>

         <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{template?.title || `${selectedVisaType.name} • ${selectedCountry.name}`}</h1>
               </div>
               <p className="text-slate-600 mb-4">{template?.summary || `Official requirements for ${selectedVisaType.name} to ${selectedCountry.name}.`}</p>

               <div className="flex flex-wrap gap-3 items-center text-xs">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${
                      template?.status === 'published' || !template?.status ? 'bg-green-50 text-success border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                     <ShieldCheck size={12} />
                     {template?.status === 'published' || !template?.status ? 'Official-sourced' : 'Draft'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                     <Database size={12} />
                     {versionLabel}
                  </span>

                  {template?.supersedes_template_id && (
                       <span className="text-slate-400 flex items-center gap-1">
                           <History size={12} /> Supersedes previous version
                       </span>
                  )}
               </div>

               {template?.change_summary && (
                   <div className="mt-4">
                       <button 
                         onClick={() => setExpandedChanges(!expandedChanges)}
                         className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
                       >
                           {expandedChanges ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                           What changed in this version?
                       </button>
                       {expandedChanges && (
                           <div className="mt-2 p-3 bg-blue-50/50 rounded-lg text-xs text-slate-700 border border-blue-100">
                               {template.change_summary}
                           </div>
                       )}
                   </div>
               )}
            </div>

            <div className="flex gap-3 shrink-0">
               <Button variant="secondary" onClick={() => setActiveView('marketplace')}>Find assistance</Button>
               {existingChecklist ? (
                 <Button onClick={() => { setSelectedChecklistId(existingChecklist.id); setActiveView('checklists'); }}>Continue checklist</Button>
               ) : (
                 <Button onClick={() => setActiveView('checklist-preview')}>Build checklist</Button>
               )}
            </div>
         </div>

         <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-10 flex flex-wrap gap-x-8 gap-y-4 text-xs">
              <div>
                  <span className="block text-slate-400 mb-1">Source Authority</span>
                  <span className="font-medium text-slate-900">{template?.source_org || 'Government Portal'}</span>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Published</span>
                  <span className="font-medium text-slate-900">{formatDateShort(template?.published_at)}</span>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Last Verified</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1">
                      {formatDateShort(template?.revision_date)} <CheckCircle2 size={10} className="text-success" />
                  </span>
              </div>
              <div>
                  <span className="block text-slate-400 mb-1">Revision Date</span>
                  <span className="font-medium text-slate-900">{formatDateShort(template?.revision_date)}</span>
              </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Processing Time</p>
                <p className="font-semibold text-slate-900 text-sm">{playbookMeta?.processing_time_text || 'Varies'}</p>
             </div>
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Typical Costs</p>
                <p className="font-semibold text-slate-900 text-sm">{playbookMeta?.typical_cost_text || 'Varies'}</p>
             </div>
             <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm col-span-2">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-xs text-slate-500">Meta Updated</p>
                </div>
                <p className="font-medium text-slate-900 text-xs">{formatDateShort(playbookMeta?.updated_at)}</p>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <h3 className="font-bold text-slate-900 mb-4 text-lg">Requirements Checklist</h3>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {templateItems.map((item) => (
                     <div key={item.id} className="p-4 border-b border-slate-100 last:border-0 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0"></div>
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
                              <span className="bg-slate-50 px-1.5 rounded border border-slate-100">{item.category ?? 'Documents'}</span>
                              {item.notes_hint && (
                                  <>
                                    <span>•</span>
                                    <span>{item.notes_hint}</span>
                                  </>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {playbookMeta?.refusal_reasons && playbookMeta.refusal_reasons.length > 0 && (
                 <div className="mt-8">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Common Refusal Reasons</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                       {playbookMeta.refusal_reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                       ))}
                    </ul>
                 </div>
               )}
            </div>

            <div className="space-y-8">
               <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Official Assets</h3>
                      {playbookAssets.length > 0 && <span className="text-[10px] text-slate-400">Assets updated</span>}
                  </div>
                  <div className="space-y-3">
                     {playbookAssets.filter(a => a.is_active).sort((a,b) => a.sort_order - b.sort_order).map((asset) => (
                        <a key={asset.id} href={asset.external_url || asset.file_path || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group">
                           {asset.asset_type === 'download' ? <Download size={18} className="text-slate-400 group-hover:text-primary" /> : <ExternalLink size={18} className="text-slate-400 group-hover:text-primary" />}
                           <div>
                               <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 block">{asset.title}</span>
                               <span className="text-xs text-slate-400">{asset.description}</span>
                           </div>
                        </a>
                     ))}
                  </div>
               </div>

               <div>
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Playbook Guide</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                     {playbookSections.filter(s => s.is_active).sort((a,b) => a.sort_order - b.sort_order).map((section) => (
                        <div key={section.id} className="bg-white">
                           <button 
                              onClick={() => setExpandedSections(prev => prev.includes(section.id) ? prev.filter(id => id !== section.id) : [...prev, section.id])}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                           >
                              <span className="font-medium text-slate-900 text-sm">{section.title}</span>
                              {expandedSections.includes(section.id) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                           </button>
                           {expandedSections.includes(section.id) && (
                              <div className="px-4 pb-4 bg-slate-50/50">
                                 <p className="text-sm text-slate-600 leading-relaxed mb-2">{String(section.content_json)}</p>
                                 <p className="text-[10px] text-slate-400 text-right">Section updated: {formatDateShort(section.updated_at)}</p>
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

  const renderChecklistPreview = () => {
    if (!selectedCountry || !selectedVisaType || !template) {
      setActiveView('find');
      return null;
    }

    const existingChecklist = myChecklists.find(
      (c) => c.country_id === selectedCountry.id && c.visa_type_id === selectedVisaType.id
    );

    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-16">
         <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button onClick={() => setActiveView('playbook')} className="hover:text-slate-900">Playbook</button>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium">Create Checklist</span>
         </div>

         <div className="flex items-start justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Checklist: {template.title}</h1>
               <div className="flex flex-col gap-1 text-sm text-slate-600">
                   <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                         <Database size={12} /> v{template.version}.0 ({formatDateShort(template.revision_date)})
                      </span>
                      {template.source_url && (
                        <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline text-xs font-medium">
                           <ExternalLink size={12} /> Official source: {template.source_org || 'Government Portal'}
                        </a>
                      )}
                   </div>
                   <div className="flex items-center gap-1.5 text-xs mt-1">
                      <Clock size={12} className="text-slate-400" /> 
                      Last verified: <span className="font-medium text-slate-900">{formatDateShort(template.last_verified_at)}</span>
                   </div>
               </div>

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
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                     <div className="col-span-6">Requirement</div>
                     <div className="col-span-3">Status</div>
                     <div className="col-span-3 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                     {templateItems.map((item) => (
                        <div key={item.id} className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors">
                           <div className="col-span-6">
                              <p className="font-medium text-slate-900 text-sm mb-0.5">{item.label}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                 {item.required && <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 rounded">REQUIRED</span>}
                                 <span className="text-[10px] text-slate-400">{item.category ?? 'Documents'}</span>
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

               <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Personal Notes</label>
                  <textarea 
                     className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                     placeholder="Add any specific details about your case here..."
                  ></textarea>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-primary text-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Ready to start?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                     By creating this checklist, you can track your progress, upload documents securely, and get alerts if requirements change.
                  </p>
                  {existingChecklist ? (
                    <Button className="w-full bg-white text-primary hover:bg-slate-100 border-0" onClick={() => { setSelectedChecklistId(existingChecklist.id); setActiveView('checklists'); }}>
                      Continue Checklist
                    </Button>
                  ) : (
                    <Button className="w-full bg-white text-primary hover:bg-slate-100 border-0" onClick={handleCreateChecklist}>
                      Create Checklist
                    </Button>
                  )}
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
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete checklist?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently remove the checklist and its items. This can't be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteDialog({ open: false, checklistId: null })}
                className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteDialog({ open: false, checklistId: null })}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                onClick={confirmDeleteChecklist}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {completeDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mark checklist as completed?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will mark the checklist as completed and remove it from your active checklists.
                </p>
              </div>
              <button
                onClick={() => setCompleteDialog({ open: false, checklistId: null })}
                className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCompleteDialog({ open: false, checklistId: null })}>
                Cancel
              </Button>
              <Button
                onClick={confirmCompleteChecklist}
              >
                Mark As Completed
              </Button>
            </div>
          </div>
        </div>
      )}
      {commentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col max-h-[600px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Comments</h3>
                <p className="text-sm text-slate-500 mt-1">{commentModal.itemLabel}</p>
              </div>
              <button
                onClick={() => setCommentModal({ open: false, itemId: null, itemLabel: null })}
                className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="space-y-4">
                {comments
                  .filter(c => c.itemId === commentModal.itemId)
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
                {comments.filter(c => c.itemId === commentModal.itemId).length === 0 && (
                  <p className="text-xs text-center text-slate-400 italic py-4">No comments yet.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Type a comment..."
                  className="w-full h-20 p-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
      )}
      {uploadModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Document</h3>
                <p className="text-sm text-slate-500 mt-1">{uploadModal.itemLabel}</p>
              </div>
              <button
                onClick={() => setUploadModal({ open: false, itemId: null, itemLabel: null })}
                className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <label className="block">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'PDF, DOC, DOCX, JPG, PNG (max. 10MB)'}
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 10485760) {
                        showToast("File size must be less than 10MB.", "error");
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                />
              </div>
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setUploadModal({ open: false, itemId: null, itemLabel: null });
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.tone === "success"
              ? "bg-white border-emerald-200 text-emerald-700"
              : "bg-white border-rose-200 text-rose-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </DashboardLayout>
  );
};



