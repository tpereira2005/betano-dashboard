import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
}

export const createProfile = async (name: string): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, name })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const deleteProfile = async (profileId: string): Promise<void> => {
    // First delete all transactions for this profile
    const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('profile_id', profileId);

    if (txError) throw txError;

    // Then delete the profile
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

    if (error) throw error;
};

export const getOrCreateDefaultProfile = async (): Promise<Profile> => {
    const profiles = await getProfiles();

    if (profiles.length > 0) {
        return profiles[0];
    }

    // Create default profile
    return await createProfile('Principal');
};

export const renameProfile = async (profileId: string, newName: string): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', profileId);

    if (error) throw error;
};
