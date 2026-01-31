
import { useState, useEffect, useCallback } from 'react';
import collectionService, { CollectionItem } from '../services/collectionService';

interface UseCollectionOptions {
    limit?: number;
    initialPage?: number;
    autoLoad?: boolean;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}

/**
 * Hook to fetch data from a dynamic collection
 * @param collectionName The system name of the collection
 * @param options Configuration options
 */
export function useCollection<T = CollectionItem>(collectionName: string, options: UseCollectionOptions = {}) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(options.initialPage || 1);
    
    const { 
        limit = 20, 
        autoLoad = true,
        orderBy = 'createdAt', 
        orderDir = 'desc' 
    } = options;

    const fetchData = useCallback(async (pageNum = page, search?: string) => {
        if (!collectionName) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const result = await collectionService.getCollectionItems(collectionName, {
                page: pageNum,
                limit,
                orderBy,
                orderDir,
                search
            });

            // Cast generic T, assuming it matches schema
            if (result.success && result.items) {
                setData(result.items as unknown as T[]);
                setTotal(result.total);
                setPage(pageNum);
            } else {
                 setData([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load collection data');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [collectionName, limit, orderBy, orderDir]);

    useEffect(() => {
        if (collectionName && autoLoad) {
            fetchData();
        }
    }, [collectionName, autoLoad, fetchData]);

    const create = async (attributes: Partial<T>) => {
        try {
            setLoading(true);
            const newItem = await collectionService.createItem(collectionName, attributes);
            await fetchData(); // Refresh list
            return newItem as unknown as T;
        } catch (err: any) {
            setError(err.message || 'Failed to create item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: string, attributes: Partial<T>) => {
        try {
            setLoading(true);
            const updatedItem = await collectionService.updateItem(collectionName, id, attributes);
            await fetchData(); // Refresh list
            return updatedItem as unknown as T;
        } catch (err: any) {
            setError(err.message || 'Failed to update item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: string) => {
        try {
            setLoading(true);
            await collectionService.deleteItem(collectionName, id);
            await fetchData(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Failed to delete item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getItem = async (id: string) => {
        try {
            setLoading(true);
            const item = await collectionService.getCollectionItem(collectionName, id);
            return item as unknown as T;
        } catch (err: any) {
            setError(err.message || 'Failed to get item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        total,
        page,
        refetch: fetchData,
        loadMore: () => fetchData(page + 1),
        create,
        update,
        remove,
        getItem
    };
}
