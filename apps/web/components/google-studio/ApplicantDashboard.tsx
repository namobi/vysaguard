"use client";

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
  MoreVertical
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';

interface ApplicantDashboardProps {
  onLogout: () => void;
  userName?: string;
}

type ViewState = 'dashboard' | 'checklists' | 'marketplace' | 'requests' | 'notifications' | 'settings';

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ onLogout, userName = "User" }) => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const isNewUser = true;

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
             <Button className="w-full">Build checklist</Button>
             <p className="text-xs text-slate-500 text-center px-2">Track requirements yourself with an official checklist</p>
          </div>
          {/* Option 2 */}
          <div className="flex flex-col gap-2">
             <Button variant="secondary" className="w-full">Find verified vendors</Button>
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
      {(activeView === 'marketplace' || activeView === 'notifications' || activeView === 'settings') && (
        <div className="text-center py-20 text-slate-400">
          <p>This view is not part of the current design task.</p>
          <Button variant="ghost" className="mt-4" onClick={() => setActiveView('dashboard')}>Return to Dashboard</Button>
        </div>
      )}
    </DashboardLayout>
  );
};