import { useState, useCallback } from 'react';
import { circleApi, CreateCircleRequest, UpdateCircleRequest } from '../services/api/circle';
import { useUserData } from '../contexts/UserDataContext';
import { Alert } from 'react-native';

export const useCircle = () => {
    const {
        families: circles,
        selectedCircle: selectedCircleName,
        setSelectedCircle: setSelectedCircleName,
        loadData: refreshCircles,
        circleStatusMembers: members,
    } = useUserData();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derived state
    const currentCircle = circles.find(c => c.name === selectedCircleName) || null;
    const currentCircleId = currentCircle?.id;

    const selectCircle = useCallback((circleName: string) => {
        setSelectedCircleName(circleName);
    }, [setSelectedCircleName]);

    const createCircle = useCallback(async (data: CreateCircleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await circleApi.createCircle(data);
            if (response.success) {
                await refreshCircles();
                selectCircle(response.circle.name);
                return response.circle;
            } else {
                throw new Error('Failed to create circle');
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to create circle';
            setError(msg);
            Alert.alert('Error', msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [refreshCircles, selectCircle]);

    const updateCircle = useCallback(async (data: UpdateCircleRequest) => {
        if (!currentCircleId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await circleApi.updateCircle(currentCircleId, data);
            if (response.success) {
                await refreshCircles();
                return response.circle;
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to update circle';
            setError(msg);
            Alert.alert('Error', msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentCircleId, refreshCircles]);

    const deleteCircle = useCallback(async () => {
        if (!currentCircleId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await circleApi.deleteCircle(currentCircleId);
            if (response.success) {
                await refreshCircles();
                // Select another circle if available
                if (circles.length > 1) {
                    const next = circles.find(c => c.id !== currentCircleId);
                    if (next) selectCircle(next.name);
                } else {
                    setSelectedCircleName('');
                }
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to delete circle';
            setError(msg);
            Alert.alert('Error', msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentCircleId, circles, refreshCircles, selectCircle, setSelectedCircleName]);

    const leaveCircle = useCallback(async () => {
        if (!currentCircleId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await circleApi.leaveCircle(currentCircleId);
            if (response.success) {
                await refreshCircles();
                if (circles.length > 1) {
                    const next = circles.find(c => c.id !== currentCircleId);
                    if (next) selectCircle(next.name);
                } else {
                    setSelectedCircleName('');
                }
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to leave circle';
            setError(msg);
            Alert.alert('Error', msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentCircleId, circles, refreshCircles, selectCircle, setSelectedCircleName]);

    const inviteMember = useCallback(async (email: string, role: 'admin' | 'member' = 'member') => {
        if (!currentCircleId) return;
        setLoading(true);
        try {
            await circleApi.addCircleMember(currentCircleId, { email, role });
            Alert.alert('Success', 'Invitation sent');
        } catch (err: any) {
            const msg = err.message || 'Failed to invite member';
            Alert.alert('Error', msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentCircleId]);

    return {
        circles,
        currentCircle,
        selectedCircleName,
        members,
        loading,
        error,
        selectCircle,
        createCircle,
        updateCircle,
        deleteCircle,
        leaveCircle,
        inviteMember,
        refreshCircles
    };
};
