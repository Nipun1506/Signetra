import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin' | 'lead_admin' | 'none';

interface AuthContextType {
  role: UserRole;
  baseRole: UserRole;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('none'); 
  const [baseRole, setBaseRoleState] = useState<UserRole>('none');

  useEffect(() => {
    const savedProfile = localStorage.getItem('signetra_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        
        if (parsed.role === 'Lead Administrator') setRoleState('lead_admin');
        else if (parsed.role === 'Administrator') setRoleState('admin');
        else setRoleState('user');

        if (parsed.baseRole) {
            if (parsed.baseRole === 'Lead Administrator') setBaseRoleState('lead_admin');
            else if (parsed.baseRole === 'Administrator') setBaseRoleState('admin');
            else setBaseRoleState('user');
        } else {
            // Fallback for an old session
            if (parsed.role === 'Lead Administrator') setBaseRoleState('lead_admin');
            else if (parsed.role === 'Administrator') setBaseRoleState('admin');
            else setBaseRoleState('user');
        }

      } catch (e) {
        setRoleState('none');
        setBaseRoleState('none');
      }
    } else {
      setRoleState('none');
      setBaseRoleState('none');
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);

    if (newRole === 'none') {
      localStorage.removeItem('signetra_profile');
      setBaseRoleState('none');
      return;
    }

    const savedProfile = localStorage.getItem('signetra_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      
      // Update impersonated role
      if (newRole === 'lead_admin') parsed.role = 'Lead Administrator';
      else if (newRole === 'admin') parsed.role = 'Administrator';
      else parsed.role = 'Standard User';
      
      // Sync React state with the database truth written during login
      if (parsed.baseRole) {
          if (parsed.baseRole === 'Lead Administrator') setBaseRoleState('lead_admin');
          else if (parsed.baseRole === 'Administrator') setBaseRoleState('admin');
          else setBaseRoleState('user');
      } else {
          setBaseRoleState('none');
      }
      
      // Keep existing baseRole intact, do not overwrite it on simple switcher click
      localStorage.setItem('signetra_profile', JSON.stringify(parsed));
    } else {
      const realRoleStr = newRole === 'lead_admin' ? 'Lead Administrator' : newRole === 'admin' ? 'Administrator' : 'Standard User';
      localStorage.setItem('signetra_profile', JSON.stringify({
        firstName: 'Guest',
        lastName: 'User',
        email: 'user@signetra.local',
        role: realRoleStr,
        baseRole: realRoleStr,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        avatarUrl: ''
      }));
      setBaseRoleState(newRole);
    }
  };

  return (
    <AuthContext.Provider value={{ role, baseRole, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
