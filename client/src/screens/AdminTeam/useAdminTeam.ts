import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getTeamMembers, updateTeamMember, clearTeamMember } from '../../utils/api_request/team_members';
import { fileToBase64, validateImageFile } from '../../utils/helpers';
import type { TeamMember, TeamMemberSlot } from '../../types/team_member';

interface SlotFormState {
  name: string;
  designation: string;
  photoPreview: string;
  isDirty: boolean;
}

type SlotForms = Record<TeamMemberSlot, SlotFormState>;

const emptySlotForm = (): SlotFormState => ({ name: '', designation: '', photoPreview: '', isDirty: false });

export const useAdminTeam = () => {
  const [members, setMembers]     = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms]         = useState<SlotForms>({
    1: emptySlotForm(),
    2: emptySlotForm(),
    3: emptySlotForm(),
  });
  const [saving, setSaving]       = useState<Record<TeamMemberSlot, boolean>>({ 1: false, 2: false, 3: false });
  const [clearing, setClearing]   = useState<Record<TeamMemberSlot, boolean>>({ 1: false, 2: false, 3: false });
  const [clearTarget, setClearTarget] = useState<TeamMemberSlot | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data);
      const init: SlotForms = { 1: emptySlotForm(), 2: emptySlotForm(), 3: emptySlotForm() };
      data.forEach((m) => {
        init[m.slot] = { name: m.name, designation: m.designation, photoPreview: m.photoUrl, isDirty: false };
      });
      setForms(init);
    } finally {
      setIsLoading(false);
    }
  };

  const setSlotField = useCallback((slot: TeamMemberSlot, field: 'name' | 'designation', value: string) => {
    setForms((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], [field]: value, isDirty: true },
    }));
  }, []);

  const handlePhotoUpload = useCallback(async (slot: TeamMemberSlot, file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    const b64 = await fileToBase64(file);
    setForms((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], photoPreview: b64, isDirty: true },
    }));
  }, []);

  const handleSave = useCallback(async (slot: TeamMemberSlot) => {
    const f = forms[slot];
    if (!f.name.trim())        { toast.error('Name is required'); return; }
    if (!f.designation.trim()) { toast.error('Designation is required'); return; }
    if (!f.photoPreview)       { toast.error('Please upload a photo'); return; }
    setSaving((prev) => ({ ...prev, [slot]: true }));
    try {
      const updated = await updateTeamMember(slot, {
        name: f.name.trim(),
        designation: f.designation.trim(),
        photoBase64: f.photoPreview,
      });
      setMembers((prev) => prev.map((m) => (m.slot === slot ? updated : m)));
      setForms((prev) => ({ ...prev, [slot]: { ...prev[slot], isDirty: false } }));
      toast.success(`Slot ${slot} saved!`);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving((prev) => ({ ...prev, [slot]: false }));
    }
  }, [forms]);

  const openClearConfirm = useCallback((slot: TeamMemberSlot) => setClearTarget(slot), []);
  const cancelClear      = useCallback(() => setClearTarget(null), []);
  const confirmClear     = useCallback(async () => {
    if (!clearTarget) return;
    setClearing((prev) => ({ ...prev, [clearTarget]: true }));
    try {
      const updated = await clearTeamMember(clearTarget);
      setMembers((prev) => prev.map((m) => (m.slot === clearTarget ? updated : m)));
      setForms((prev) => ({ ...prev, [clearTarget]: emptySlotForm() }));
      toast.success(`Slot ${clearTarget} cleared`);
      setClearTarget(null);
    } finally {
      setClearing((prev) => ({ ...prev, [clearTarget!]: false }));
    }
  }, [clearTarget]);

  return {
    members, isLoading, forms, saving, clearing, clearTarget,
    setSlotField, handlePhotoUpload, handleSave,
    openClearConfirm, cancelClear, confirmClear,
  };
};

export type ReturnTypeOfUseAdminTeam = ReturnType<typeof useAdminTeam>;
