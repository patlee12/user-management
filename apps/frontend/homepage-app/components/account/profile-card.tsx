'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UpdateProfileDto } from '@user-management/types';
import EditableField from '@/components/ui/forms/editable-field';
import { updateCurrentUserProfile } from '@/app/services/profile-service';
import { Button } from '@/components/ui/buttons/button';
import { Pencil } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import FormModal, { FieldConfig } from '../ui/modals/form-modal';

interface ProfileCardProps {
  profile: UpdateProfileDto;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { loadUser } = useAuthStore();
  const [state, setState] = useState<UpdateProfileDto>({
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    location: profile.location,
    experience: profile.experience,
    github: profile.github,
    website: profile.website,
    avatarUrl: profile.avatarUrl,
  });
  const [showAvatarModal, setAvatarModal] = useState(false);
  const fields: FieldConfig[] = [
    { key: 'avatarUrl', label: 'Avatar URL', type: 'url' },
  ];
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateField = (key: keyof UpdateProfileDto, value: string | null) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    await updateCurrentUserProfile(state);
    setSaving(false);
    setIsSaved(true);
    await loadUser();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAvatarChange = () => {
    setAvatarModal(!showAvatarModal);
  };

  const githubClean = state.github?.replace('@', '');

  return (
    <div className="w-full max-w-2xl glow-box rounded-[2rem] p-6 sm:p-10 group">
      <div className="flex flex-col items-center space-y-6">
        <div
          className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[3px] border-emerald-500/70 overflow-hidden shadow-[0_0_30px_#10b98166] transition-transform duration-300 group-hover:scale-105 cursor-pointer group/avatar"
          onClick={handleAvatarChange}
        >
          {state.avatarUrl && !state.avatarUrl.startsWith('/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.avatarUrl}
              alt="Profile"
              className="object-cover bg-white w-full h-full"
            />
          ) : (
            <Image
              src={state.avatarUrl || '/images/defaultProfile.svg'}
              alt="Profile"
              fill
              priority
              className="object-cover bg-white"
            />
          )}
          {showAvatarModal && (
            <FormModal
              className="bg-gray/400"
              title="Update Profile Avatar"
              isOpen={showAvatarModal}
              onClose={handleAvatarChange}
              onSubmit={({ avatarUrl }) => updateField('avatarUrl', avatarUrl)}
              fields={fields}
              initialValues={{ avatarUrl: state.avatarUrl || '' }}
            />
          )}

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
            <Pencil className="text-white w-5 h-5" />
          </div>
        </div>

        <div className="text-center w-full max-w-sm mx-auto space-y-2">
          <EditableField
            label="Name"
            value={state.name}
            onSave={(val) => updateField('name', val)}
          />
          <EditableField
            label="Role"
            value={state.role}
            onSave={(val) => updateField('role', val)}
          />
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto pt-6">
        <EditableField
          label="Bio"
          value={state.bio}
          onSave={(val) => updateField('bio', val)}
          textarea
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-center text-muted-foreground">
        <EditableField
          label="Location"
          value={state.location}
          onSave={(val) => updateField('location', val)}
        />
        <EditableField
          label="Experience"
          value={state.experience}
          onSave={(val) => updateField('experience', val)}
        />
        <EditableField
          label="GitHub"
          value={state.github}
          onSave={(val) => updateField('github', val)}
        />
        <EditableField
          label="Website"
          value={state.website}
          onSave={(val) => updateField('website', val)}
        />
      </div>

      {githubClean && (
        <div className="flex justify-center pt-6">
          <a
            href={`https://github.com/${githubClean}`}
            target="_blank"
            className="mt-2 text-emerald-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Follow @{githubClean}
          </a>
        </div>
      )}
      <div className="flex justify-center pt-8">
        <Button
          onClick={saveProfile}
          disabled={saving}
          showSuccess={isSaved}
          className="px-8 py-3 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_12px_#10b98188]"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
