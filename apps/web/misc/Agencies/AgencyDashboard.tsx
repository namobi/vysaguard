import React from 'react';
import { 
  LayoutGrid, 
  Inbox, 
  Briefcase, 
  CheckCircle, 
  Star, 
  CreditCard,
  ShieldCheck,
  User,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './Button';

interface AgencyDashboardProps {
  onLogout: () => void;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ onLogout }) => {
  const sidebarItems = [
    { icon: <LayoutGrid size={18} />, label: "Overview", active: true },
    { icon: <Inbox size={18} />, label: "New Requests" },
    { icon: <Briefcase size={18} />, label: "Active Cases" },
    { icon: <CheckCircle size={18} />, label: "Completed Cases" },
    { icon: <Star size={18} />, label: "Reviews" },
    { icon: <CreditCard size={18} />, label: "Services & Pricing" },
    { icon: <ShieldCheck size={18} />, label: "Verification" },
  ];

  return (
    <DashboardLayout 
      userType="Verified Agent" 
      userName="Marcus Thorne" 
      sidebarItems={sidebarItems}
      onLogout={onLogout}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-slate-900">Agency Overview</h1>
         <div className="flex gap-3">
             <Button variant="outline" size="sm">Export Report</Button>
             <Button size="sm">Update Availability</Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Requests</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">4</span>
                <span className="text-xs font-medium text-success">+2 today</span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Cases</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">12</span>
                <span className="text-xs font-medium text-slate-400">On track</span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completion Rate</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">98%</span>
                <span className="text-xs font-medium text-success">Top 5%</span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
            <div className="mt-2 flex items-center gap-2">
                <ShieldCheck className="text-success" size={20} />
                <span className="text-lg font-bold text-slate-900">Verified</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Recent Requests & Active Cases */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Recent Requests */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Recent Requests</h3>
                      <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <div className="p-4 space-y-3">
                      {[1, 2].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50/50">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                      <User size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-sm">James Wilson</h4>
                                      <p className="text-xs text-slate-500">Student Visa • Australia</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="px-2 py-1 bg-amber-50 text-warning text-xs font-medium rounded-full border border-amber-100">Pending Review</span>
                                  <Button size="sm" variant="outline" className="h-8 text-xs">Review</Button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Active Cases */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Active Cases</h3>
                      <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 pl-6">Applicant</th>
                                <th className="px-6 py-3">Visa</th>
                                <th className="px-6 py-3">Progress</th>
                                <th className="px-6 py-3">Last Activity</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Maria Garcia</td>
                                <td className="px-6 py-4 text-slate-600">Skilled Migrant</td>
                                <td className="px-6 py-4">
                                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">1 hour ago</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-900"><MoreHorizontal size={16} /></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Robert Chen</td>
                                <td className="px-6 py-4 text-slate-600">Partner Visa</td>
                                <td className="px-6 py-4">
                                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">Yesterday</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-900"><MoreHorizontal size={16} /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                  </div>
              </div>

          </div>

          {/* Right Column: Tasks/Notices */}
          <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Verification Status</h3>
                  <p className="text-slate-300 text-sm mb-4">Your bi-annual license verification is due in 14 days.</p>
                  <Button variant="secondary" size="sm" className="w-full justify-center">Submit Documents</Button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Urgent Actions</h3>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <span className="text-slate-600">Upload counter-signed contract for <strong>Maria Garcia</strong></span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <span className="text-slate-600">Respond to message from <strong>Liam Smith</strong></span>
                      </li>
                  </ul>
              </div>
          </div>

      </div>
    </DashboardLayout>
  );
};