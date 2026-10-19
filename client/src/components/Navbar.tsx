import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, LogOut, PlusCircle, ClipboardList, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Building2 size={24} />
          <span>Конференции.РФ</span>
        </Link>

        <nav className="navbar-links">
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Панель администратора
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <ClipboardList size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Мои заявки
                  </NavLink>
                  <NavLink
                    to="/create-request"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <PlusCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Создать заявку
                  </NavLink>
                </>
              )}

              <div className="user-badge">
                <span>{user.fullName}</span>
                <span className={`role-tag ${user.role.toLowerCase()}`}>
                  {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </span>
              </div>

              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Выйти из системы">
                <LogOut size={16} />
                <span>Выход</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Вход
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
