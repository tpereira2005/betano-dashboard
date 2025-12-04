import { supabase } from '../lib/supabase';
import { RawTransaction } from '../types';

export const saveTransactions = async (transactions: RawTransaction[], profileId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Delete existing transactions for this profile
    const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

    if (deleteError) throw deleteError;

    // Insert new transactions in batches to avoid payload limits
    const batchSize = 1000;
    for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize).map(t => ({
            user_id: user.id,
            profile_id: profileId,
            date: t.Date,
            type: t.Tipe,
            value: t.Vaule
        }));

        const { error: insertError } = await supabase
            .from('transactions')
            .insert(batch);

        if (insertError) throw insertError;
    }
};

export const fetchTransactions = async (profileId?: string): Promise<RawTransaction[]> => {
    let query = supabase
        .from('transactions')
        .select('date, type, value, profile_id');

    // If profileId is provided, filter by it. Otherwise, get all profiles (combined view)
    if (profileId) {
        query = query.eq('profile_id', profileId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((row: any) => ({
        Date: row.date,
        Tipe: row.type,
        Vaule: row.value
    }));
};

export const addNewTransactions = async (transactions: RawTransaction[], profileId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch existing transactions for this profile
    const existing = await fetchTransactions(profileId);

    // Create maps for comparison
    const existingMap = new Map(
        existing.map(t => [`${t.Date}|${t.Tipe}`, t])
    );

    const newMap = new Map(
        transactions.map(t => [`${t.Date}|${t.Tipe}`, t])
    );

    // Find conflicts: same date+type but different value
    const conflicts: Array<{ date: string; type: string; oldValue: string; newValue: string }> = [];

    for (const [key, newTx] of newMap) {
        const existingTx = existingMap.get(key);
        if (existingTx && existingTx.Vaule !== newTx.Vaule) {
            conflicts.push({
                date: newTx.Date,
                type: newTx.Tipe,
                oldValue: existingTx.Vaule,
                newValue: newTx.Vaule
            });
        }
    }

    // If there are conflicts, return them without making changes
    if (conflicts.length > 0) {
        return {
            added: 0,
            total: transactions.length,
            conflicts,
            hasConflicts: true
        };
    }

    // Create a Set of unique keys for existing transactions (date+type+value)
    const existingKeys = new Set(
        existing.map(t => `${t.Date}|${t.Tipe}|${t.Vaule}`)
    );

    // Filter out transactions that already exist
    const newTransactions = transactions.filter(t => {
        const key = `${t.Date}|${t.Tipe}|${t.Vaule}`;
        return !existingKeys.has(key);
    });

    if (newTransactions.length === 0) {
        return { added: 0, total: transactions.length, conflicts: [], hasConflicts: false };
    }

    // Insert only new transactions
    const batchSize = 1000;
    for (let i = 0; i < newTransactions.length; i += batchSize) {
        const batch = newTransactions.slice(i, i + batchSize).map(t => ({
            user_id: user.id,
            profile_id: profileId,
            date: t.Date,
            type: t.Tipe,
            value: t.Vaule
        }));

        const { error: insertError } = await supabase
            .from('transactions')
            .insert(batch);

        if (insertError) throw insertError;
    }

    return { added: newTransactions.length, total: transactions.length, conflicts: [], hasConflicts: false };
};

export const replaceTransactions = async (transactions: RawTransaction[], profileId: string) => {
    // This is the same as saveTransactions - completely replace
    return saveTransactions(transactions, profileId);
};
