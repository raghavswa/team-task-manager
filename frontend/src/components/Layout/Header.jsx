import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../UI/Avatar';
import toast from 'react-hot-toast';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your work' },
  '/projects':  { title: 'Projects',  sub: 'All your projects' },
  '/tasks/my':  { title: 'My Tasks',  sub: 'Tasks assigned to you' },
  '/admin':     { title: 'Admin Panel', sub: 'System management' },
};

export default function Header() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const meta = Object.entries(PAGE_META).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || { title: 'TaskFlow', sub: '' };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out.');
    } catch {
      toast.error('Logout failed.');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">{meta.title}</h1>
        {meta.sub && <p className="text-xs text-slate-400">{meta.sub}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-100" />

        {/* User menu */}
        <div className="flex items-center gap-2.5">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.systemRole === 'superadmin' ? '⚡ Super Admin' : 'Member'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
