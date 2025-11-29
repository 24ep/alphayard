import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { FamilyService } from '../services/hourse/FamilyService';
import { hourse, FamilyMember, FamilyInvitation } from '../types/hourse';

// State interface
interface FamilyState {
  currentFamily: hourse | null;
  families: hourse[];
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  loading: boolean;
  error: string | null;
}

// Action types
type FamilyAction =
  | { type: 'FAMILY_START' }
  | { type: 'FAMILY_SUCCESS'; payload: { families: hourse[]; currentFamily: hourse | null; members: FamilyMember[] } }
  | { type: 'FAMILY_FAILURE'; payload: string }
  | { type: 'INVITATIONS_SUCCESS'; payload: FamilyInvitation[] }
  | { type: 'CREATE_FAMILY_SUCCESS'; payload: hourse }
  | { type: 'JOIN_FAMILY_SUCCESS'; payload: hourse }
  | { type: 'LEAVE_FAMILY_SUCCESS'; payload: string }
  | { type: 'UPDATE_FAMILY_SUCCESS'; payload: hourse }
  | { type: 'REMOVE_MEMBER_SUCCESS'; payload: string }
  | { type: 'UPDATE_MEMBER_SUCCESS'; payload: FamilyMember }
  | { type: 'ACCEPT_INVITATION_SUCCESS'; payload: { hourse: hourse; invitationId: string } }
  | { type: 'DECLINE_INVITATION_SUCCESS'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: FamilyState = {
  currentFamily: null,
  families: [],
  members: [],
  invitations: [],
  loading: false,
  error: null,
};

// Reducer function
const familyReducer = (state: FamilyState, action: FamilyAction): FamilyState => {
  switch (action.type) {
    case 'FAMILY_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FAMILY_SUCCESS':
      return {
        ...state,
        families: action.payload.families,
        currentFamily: action.payload.currentFamily,
        members: action.payload.members,
        loading: false,
        error: null,
      };
    case 'FAMILY_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'INVITATIONS_SUCCESS':
      return {
        ...state,
        invitations: action.payload,
        loading: false,
        error: null,
      };
    case 'CREATE_FAMILY_SUCCESS':
      return {
        ...state,
        families: [...state.families, action.payload],
        currentFamily: action.payload,
        members: action.payload.members,
        loading: false,
        error: null,
      };
    case 'JOIN_FAMILY_SUCCESS':
      return {
        ...state,
        families: [...state.families, action.payload],
        currentFamily: action.payload,
        members: action.payload.members,
        invitations: state.invitations.filter(inv => inv.familyId !== action.payload.id),
        loading: false,
        error: null,
      };
    case 'LEAVE_FAMILY_SUCCESS':
      return {
        ...state,
        families: state.families.filter(f => f.id !== action.payload),
        currentFamily: null,
        members: [],
        loading: false,
        error: null,
      };
    case 'UPDATE_FAMILY_SUCCESS':
      return {
        ...state,
        families: state.families.map(f => f.id === action.payload.id ? action.payload : f),
        currentFamily: state.currentFamily?.id === action.payload.id ? action.payload : state.currentFamily,
        loading: false,
        error: null,
      };
    case 'REMOVE_MEMBER_SUCCESS':
      return {
        ...state,
        members: state.members.filter(m => m.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'UPDATE_MEMBER_SUCCESS':
      return {
        ...state,
        members: state.members.map(m => m.id === action.payload.id ? action.payload : m),
        loading: false,
        error: null,
      };
    case 'ACCEPT_INVITATION_SUCCESS':
      return {
        ...state,
        families: [...state.families, action.payload.hourse],
        currentFamily: action.payload.hourse,
        members: action.payload.hourse.members,
        invitations: state.invitations.filter(inv => inv.id !== action.payload.invitationId),
        loading: false,
        error: null,
      };
    case 'DECLINE_INVITATION_SUCCESS':
      return {
        ...state,
        invitations: state.invitations.filter(inv => inv.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context interface
interface FamilyContextType extends FamilyState {
  loadFamilyData: () => Promise<void>;
  createFamily: (data: Partial<hourse>) => Promise<void>;
  joinFamily: (invitationId: string) => Promise<void>;
  leaveFamily: (familyId: string) => Promise<void>;
  inviteMember: (familyId: string, email: string, role?: string) => Promise<void>;
  removeMember: (familyId: string, memberId: string) => Promise<void>;
  updateMemberRole: (familyId: string, memberId: string, role: string) => Promise<void>;
  updateFamilySettings: (familyId: string, settings: Partial<hourse>) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Provider component
interface FamilyProviderProps {
  children: ReactNode;
}

export const FamilyProvider: React.FC<FamilyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(familyReducer, initialState);

  // Load hourse data on mount
  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const [familiesResponse, invitationsResponse] = await Promise.all([
        FamilyService.getFamilies(),
        FamilyService.getInvitations(),
      ]);

      const families = familiesResponse.data;
      const currentFamily = families.find(f => f.isCurrent) || null;
      const members = currentFamily ? currentFamily.members : [];

      dispatch({
        type: 'FAMILY_SUCCESS',
        payload: { families, currentFamily, members }
      });

      dispatch({
        type: 'INVITATIONS_SUCCESS',
        payload: invitationsResponse.data
      });
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to load hourse data'
      });
    }
  };

  const createFamily = async (data: Partial<hourse>) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const response = await FamilyService.createFamily(data);
      
      dispatch({ type: 'CREATE_FAMILY_SUCCESS', payload: response.data });
      
      Alert.alert('Success', 'hourse created successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to create hourse'
      });
      throw error;
    }
  };

  const joinFamily = async (invitationId: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const response = await FamilyService.acceptInvitation(invitationId);
      
      dispatch({
        type: 'ACCEPT_INVITATION_SUCCESS',
        payload: { hourse: response.data, invitationId }
      });
      
      Alert.alert('Success', 'Joined hourse successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to join hourse'
      });
      throw error;
    }
  };

  const leaveFamily = async (familyId: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      await FamilyService.leaveFamily(familyId);
      
      dispatch({ type: 'LEAVE_FAMILY_SUCCESS', payload: familyId });
      
      Alert.alert('Success', 'Left hourse successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to leave hourse'
      });
      throw error;
    }
  };

  const inviteMember = async (familyId: string, email: string, role: string = 'member') => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      await FamilyService.inviteMember(familyId, { email, role });
      
      dispatch({ type: 'CLEAR_ERROR' });
      
      Alert.alert('Success', 'Invitation sent successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to send invitation'
      });
      throw error;
    }
  };

  const removeMember = async (familyId: string, memberId: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      await FamilyService.removeMember(familyId, memberId);
      
      dispatch({ type: 'REMOVE_MEMBER_SUCCESS', payload: memberId });
      
      Alert.alert('Success', 'Member removed successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to remove member'
      });
      throw error;
    }
  };

  const updateMemberRole = async (familyId: string, memberId: string, role: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const response = await FamilyService.updateMemberRole(familyId, memberId, role);
      
      dispatch({ type: 'UPDATE_MEMBER_SUCCESS', payload: response.data });
      
      Alert.alert('Success', 'Member role updated successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to update member role'
      });
      throw error;
    }
  };

  const updateFamilySettings = async (familyId: string, settings: Partial<hourse>) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const response = await FamilyService.updateFamily(familyId, settings);
      
      dispatch({ type: 'UPDATE_FAMILY_SUCCESS', payload: response.data });
      
      Alert.alert('Success', 'hourse settings updated successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to update hourse settings'
      });
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      const response = await FamilyService.acceptInvitation(invitationId);
      
      dispatch({
        type: 'ACCEPT_INVITATION_SUCCESS',
        payload: { hourse: response.data, invitationId }
      });
      
      Alert.alert('Success', 'Invitation accepted successfully');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to accept invitation'
      });
      throw error;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      dispatch({ type: 'FAMILY_START' });
      
      await FamilyService.declineInvitation(invitationId);
      
      dispatch({ type: 'DECLINE_INVITATION_SUCCESS', payload: invitationId });
      
      Alert.alert('Success', 'Invitation declined');
    } catch (error: any) {
      dispatch({
        type: 'FAMILY_FAILURE',
        payload: error.message || 'Failed to decline invitation'
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: FamilyContextType = {
    ...state,
    loadFamilyData,
    createFamily,
    joinFamily,
    leaveFamily,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateFamilySettings,
    acceptInvitation,
    declineInvitation,
    clearError,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

// Custom hook to use hourse context
export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}; 