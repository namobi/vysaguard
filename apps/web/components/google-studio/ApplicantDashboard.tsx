import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';

interface ApplicantDashboardProps {
  onLogout: () => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ onLogout }) => {
  // Toggle for development/demo purposes to show New User state
  const isNewUser = true;

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: true },
    { icon: <CheckSquare size={18} />, label: "My Checklists", disabled: isNewUser },
    { icon: <ShoppingBag size={18} />, label: "Marketplace" },
    { icon: <FileText size={18} />, label: "My Requests", disabled: isNewUser },
    { icon: <Bell size={18} />, label: "Notifications" },
    { icon: <Settings size={18} />, label: "Profile & Settings" },
  ];

  return (
    <DashboardLayout 
      userType="Applicant" 
      userName="Sarah Jenkins" 
      sidebarItems={sidebarItems}
      onLogout={onLogout}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {isNewUser ? "Welcome, Sarah" : "Welcome back, Sarah"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isNewUser ? "Let's get you moving." : "Here’s the current status of your visa applications."}
        </p>
      </div>

      {isNewUser ? (
        // NEW USER STATE
        <>
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
      ) : (
        // ACTIVE USER STATE (Existing content)
        <>
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

          {/* Bottom Section: Next Steps */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Recommended Next Steps</h3>
            <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-slate-300 transition-colors cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Upload Bank Statements</p>
                            <p className="text-xs text-slate-500">Portugal Digital Nomad • Proof of Income</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary" />
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-slate-300 transition-colors cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-success flex items-center justify-center">
                            <CheckCircle2 size={16} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Review Health Insurance Requirements</p>
                            <p className="text-xs text-slate-500">Updated today by Official Source</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary" />
                </div>
            </div>
          </div>
        </>
      )}

    </DashboardLayout>
  );
};