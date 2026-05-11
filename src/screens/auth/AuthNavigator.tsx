import React, { useState } from 'react';
import { AuthUser } from '../../types';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

type Screen = 'login' | 'register';

interface Props {
  onAuth: (user: AuthUser) => void;
}

export default function AuthNavigator({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login');

  if (screen === 'register') {
    return (
      <RegisterScreen
        onAuth={onAuth}
        onGoLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      onAuth={onAuth}
      onGoRegister={() => setScreen('register')}
    />
  );
}
