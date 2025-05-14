'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProfileEntity } from '@user-management/types';
import EditableField from '@/components/ui/forms/editable-field';
import { updateCurrentUserProfile } from '@/app/services/profile-service';
import { Button } from '@/components/ui/buttons/button';

interface ProfileCardProps {
  profile: ProfileEntity;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [state, setState] = useState<Partial<ProfileEntity>>({
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    location: profile.location,
    experience: profile.experience,
    github: profile.github,
    website: profile.website,
  });

  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateField = (key: keyof ProfileEntity, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    await updateCurrentUserProfile(state);
    setSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const githubClean = state.github?.replace('@', '');

  return (
    <div className="w-full max-w-2xl rounded-[2rem] bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-700/60 p-6 sm:p-10 shadow-[0_0_60px_#00ffcc22] transition-all duration-300 group hover:shadow-[0_0_80px_#00ffcc33] hover:-translate-y-1">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[3px] border-emerald-500/70 overflow-hidden shadow-[0_0_30px_#10b98166] transition-transform duration-300 group-hover:scale-105">
          <Image
            src={profile.avatarUrl || '/images/defaultProfile.svg'}
            alt="Profile"
            fill
            className="object-cover bg-white"
          />
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
    </div>
  );
}
