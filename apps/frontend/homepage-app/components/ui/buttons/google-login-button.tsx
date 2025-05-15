import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/buttons/button';

export function GoogleLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="
        w-full max-w-md
        flex items-center justify-center
        gap-3
        rounded-full
        text-white
        transition-all duration-150
      "
    >
      <span className="bg-zinc-800 rounded-full">
        <FcGoogle size={24} />
      </span>
      <span>Sign in with Google</span>
    </Button>
  );
}
