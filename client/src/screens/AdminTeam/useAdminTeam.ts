import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getTeamMembers,
    updateTeamMember,
    clearTeamMember,
    addTeamSlot,
    removeTeamSlot,
} from "../../utils/api_request/team_members";
import { validateImageFile } from "../../utils/helpers";
import type { TeamMember, TeamMemberSlot } from "../../types/team_member";

interface SlotFormState {
    name: string;
    designation: string;
    photoFile?: File;
    photoPreview: string;
    isDirty: boolean;
}

type SlotForms = Record<TeamMemberSlot, SlotFormState>;

const emptySlotForm = (): SlotFormState => ({
    name: "",
    designation: "",
    photoPreview: "",
    isDirty: false,
});

export const useAdminTeam = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [forms, setForms] = useState<Partial<SlotForms>>({
        1: emptySlotForm(),
        2: emptySlotForm(),
        3: emptySlotForm(),
    });
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [clearing, setClearing] = useState<Record<number, boolean>>({});
    const [clearTarget, setClearTarget] = useState<TeamMemberSlot | null>(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getTeamMembers();
            setMembers(data);
            const init: Partial<SlotForms> = {};
            data.forEach((m) => {
                init[m.slot] = {
                    name: m.name,
                    designation: m.designation,
                    photoPreview: m.photoUrl,
                    isDirty: false,
                };
            });
            setForms(init);
        } finally {
            setIsLoading(false);
        }
    };

    const setSlotField = useCallback(
        (
            slot: TeamMemberSlot,
            field: "name" | "designation",
            value: string,
        ) => {
            setForms((prev) => ({
                ...prev,
                [slot]: {
                    ...(prev[slot] || emptySlotForm()),
                    [field]: value,
                    isDirty: true,
                },
            }));
        },
        [],
    );

    const handlePhotoUpload = useCallback(
        (slot: TeamMemberSlot, file: File) => {
            const error = validateImageFile(file);
            if (error) {
                toast.error(error);
                return;
            }
            const preview = URL.createObjectURL(file);
            setForms((prev) => ({
                ...prev,
                [slot]: {
                    ...(prev[slot] || emptySlotForm()),
                    photoFile: file,
                    photoPreview: preview,
                    isDirty: true,
                },
            }));
        },
        [],
    );

    const [isAddingSlot, setIsAddingSlot] = useState(false);

    const handleAddSlot = useCallback(async () => {
        if (members.length >= 5 || isAddingSlot) {
            if (members.length >= 5)
                toast.error("Maximum 5 team member slots allowed");
            return;
        }
        setIsAddingSlot(true);
        try {
            const updatedList = await addTeamSlot();
            setMembers(updatedList);
            const newInit: Partial<SlotForms> = {};
            updatedList.forEach((m) => {
                newInit[m.slot] = forms[m.slot] || {
                    name: m.name,
                    designation: m.designation,
                    photoPreview: m.photoUrl,
                    isDirty: false,
                };
            });
            setForms(newInit);
            toast.success("Team slot added");
        } catch {
            toast.error("Failed to add slot");
        } finally {
            setIsAddingSlot(false);
        }
    }, [members.length, forms, isAddingSlot]);

    const handleRemoveSlot = useCallback(
        async (slot: TeamMemberSlot) => {
            if (members.length <= 3) {
                toast.error("Minimum 3 team member slots required");
                return;
            }
            try {
                const updatedList = await removeTeamSlot(slot);
                setMembers(updatedList);
                const newInit: Partial<SlotForms> = {};
                updatedList.forEach((m) => {
                    newInit[m.slot] = {
                        name: m.name,
                        designation: m.designation,
                        photoPreview: m.photoUrl,
                        isDirty: false,
                    };
                });
                setForms(newInit);
                toast.success(`Slot ${slot} removed`);
            } catch {
                toast.error("Failed to remove slot");
            }
        },
        [members.length],
    );

    const handleSave = useCallback(
        async (slot: TeamMemberSlot) => {
            const f = forms[slot] || emptySlotForm();
            if (!f.name.trim()) {
                toast.error("Name is required");
                return;
            }
            if (!f.designation.trim()) {
                toast.error("Designation is required");
                return;
            }
            if (!f.photoPreview && !f.photoFile) {
                toast.error("Please upload a photo");
                return;
            }
            setSaving((prev) => ({ ...prev, [slot]: true }));
            try {
                const updated = await updateTeamMember(slot, {
                    name: f.name.trim(),
                    designation: f.designation.trim(),
                    photo: f.photoFile,
                });
                setMembers((prev) =>
                    prev.map((m) => (m.slot === slot ? updated : m)),
                );
                setForms((prev) => ({
                    ...prev,
                    [slot]: {
                        name: updated.name,
                        designation: updated.designation,
                        photoPreview: updated.photoUrl,
                        photoFile: undefined,
                        isDirty: false,
                    },
                }));
                toast.success(`Slot ${slot} saved!`);
            } catch {
                toast.error("Failed to save. Please try again.");
            } finally {
                setSaving((prev) => ({ ...prev, [slot]: false }));
            }
        },
        [forms],
    );

    const openClearConfirm = useCallback(
        (slot: TeamMemberSlot) => setClearTarget(slot),
        [],
    );
    const cancelClear = useCallback(() => setClearTarget(null), []);
    const confirmClear = useCallback(async () => {
        if (!clearTarget) return;
        setClearing((prev) => ({ ...prev, [clearTarget]: true }));
        try {
            const updated = await clearTeamMember(clearTarget);
            setMembers((prev) =>
                prev.map((m) => (m.slot === clearTarget ? updated : m)),
            );
            setForms((prev) => ({ ...prev, [clearTarget]: emptySlotForm() }));
            toast.success(`Slot ${clearTarget} cleared`);
            setClearTarget(null);
        } catch {
            toast.error("Failed to clear slot");
        } finally {
            setClearing((prev) => ({ ...prev, [clearTarget!]: false }));
        }
    }, [clearTarget]);

    return {
        members,
        isLoading,
        isAddingSlot,
        forms,
        saving,
        clearing,
        clearTarget,
        setSlotField,
        handlePhotoUpload,
        handleSave,
        handleAddSlot,
        handleRemoveSlot,
        openClearConfirm,
        cancelClear,
        confirmClear,
    };
};

export type ReturnTypeOfUseAdminTeam = ReturnType<typeof useAdminTeam>;
