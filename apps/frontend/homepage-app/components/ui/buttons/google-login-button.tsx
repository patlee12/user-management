import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/buttons/button';

export function GoogleLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="
        flex items-center justify-center
        w-full max-w-xs
        bg-white text-gray-700
        border border-gray-300
        hover:bg-gray-100
        shadow-sm
        rounded-full
        px-4 py-2
        gap-2
      "
    >
      <FcGoogle size={24} />
      <span className="font-medium">Sign in with Google</span>
    </Button>
  );
}
