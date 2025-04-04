import { Suspense } from 'react';
import LoginComponent from './login-component ';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginComponent />
    </Suspense>
  );
}
