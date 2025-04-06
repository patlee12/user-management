export default function AccountRequestSuccessPage() {
  return (
    <div className="w-full h-full flex items-center justify-center text-white">
      <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-xl max-w-md text-center space-y-4">
        <h2 className="text-3xl font-bold">Request Submitted</h2>
        <p className="text-zinc-300">
          Your account request has been submitted, you should be receiving an
          email verification shortly.
        </p>
        <a href="/login" className="text-orange-400 hover:underline">
          Return to Login
        </a>
      </div>
    </div>
  );
}
