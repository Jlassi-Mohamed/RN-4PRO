'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'stock')[];
}

export default function Protected({ children, allowedRoles }: ProtectedProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // role not allowed → redirect
      router.replace('/auth/sign-in');
      return;
    }

    setChecked(true);
  }, [router, allowedRoles]);

  if (!checked) return null;
  return <>{children}</>;
}
