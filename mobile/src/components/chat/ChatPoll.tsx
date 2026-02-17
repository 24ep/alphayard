import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
  voters?: Array<{ userId: string; displayName: string }>;
}

interface Poll {
  id: string;
  question: string;
  pollType: 'single' | 'multiple' | 'quiz';
  isAnonymous: boolean;
  allowsAddOptions: boolean;
  closesAt?: string;
  isClosed: boolean;
  totalVotes: number;
  options: PollOption[];
  userVotes?: string[];
  correctOptionId?: string;
}

interface ChatPollProps {
  poll: Poll;
  onVote?: (optionIds: string[]) => void;
}

export const ChatPoll: React.FC<ChatPollProps> = ({ poll: initialPoll, onVote }) => {
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialPoll.userVotes || []);
  const [showResults, setShowResults] = useState(initialPoll.userVotes?.length ? true : false);
  const [voting, setVoting] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [addingOption, setAddingOption] = useState(false);

  const hasVoted = poll.userVotes && poll.userVotes.length > 0;
  const isExpired = poll.closesAt && new Date(poll.closesAt) < new Date();
  const canVote = !poll.isClosed && !isExpired;

  const handleSelectOption = (optionId: string) => {
    if (!canVote || voting) return;

    if (poll.pollType === 'single') {
      setSelectedOptions([optionId]);
    } else {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || voting) return;

    try {
      setVoting(true);
      const response = await chatApi.votePoll(poll.id, selectedOptions);
      if (response.success) {
        setPoll(response.poll);
        setShowResults(true);
        onVote?.(selectedOptions);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim() || addingOption) return;

    try {
      setAddingOption(true);
      const response = await chatApi.addPollOption(poll.id, newOption.trim());
      if (response.success) {
        setPoll({
          ...poll,
          options: [...poll.options, response.option],
        });
        setNewOption('');
      }
    } catch (error) {
      console.error('Error adding option:', error);
    } finally {
      setAddingOption(false);
    }
  };

  const getTimeRemaining = () => {
    if (!poll.closesAt) return null;
    const closes = new Date(poll.closesAt);
    const now = new Date();
    const diff = closes.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <View style={styles.pollContainer}>
      {/* Question */}
      <Text style={styles.question}>{poll.question}</Text>

      {/* Poll meta */}
      <View style={styles.pollMeta}>
        <Text style={styles.pollType}>
          {poll.pollType === 'single' ? 'Single choice' : 
           poll.pollType === 'multiple' ? 'Multiple choice' : 'Quiz'}
        </Text>
        {poll.isAnonymous && (
          <View style={styles.anonymousBadge}>
            <Ionicons name="eye-off" size={12} color="#6B7280" />
            <Text style={styles.anonymousText}>Anonymous</Text>
          </View>
        )}
      </View>

      {/* Options */}
      {poll.options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        const votePercentage = poll.totalVotes > 0 
          ? Math.round((option.voteCount / poll.totalVotes) * 100) 
          : 0;
        const isCorrect = poll.pollType === 'quiz' && option.id === poll.correctOptionId;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              isSelected && styles.optionSelected,
              showResults && isCorrect && styles.optionCorrect,
            ]}
            onPress={() => handleSelectOption(option.id)}
            disabled={!canVote || hasVoted}
          >
            {showResults && (
              <View 
                style={[
                  styles.optionProgress,
                  { width: `${votePercentage}%` },
                  isCorrect && styles.optionProgressCorrect,
                ]}
              />
            )}
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                {!showResults && (
                  <View style={[
                    styles.radioButton,
                    poll.pollType === 'multiple' && styles.checkbox,
                    isSelected && styles.radioSelected,
                  ]}>
                    {isSelected && (
                      <Ionicons 
                        name={poll.pollType === 'multiple' ? 'checkmark' : 'ellipse'} 
                        size={poll.pollType === 'multiple' ? 14 : 8} 
                        color="#FFFFFF" 
                      />
                    )}
                  </View>
                )}
                <Text style={styles.optionText}>{option.optionText}</Text>
                {isCorrect && showResults && (
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                )}
              </View>
              {showResults && (
                <Text style={styles.votePercentage}>{votePercentage}%</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Add option */}
      {poll.allowsAddOptions && canVote && !hasVoted && (
        <View style={styles.addOptionContainer}>
          <TextInput
            style={styles.addOptionInput}
            placeholder="Add an option..."
            value={newOption}
            onChangeText={setNewOption}
          />
          <TouchableOpacity
            onPress={handleAddOption}
            disabled={!newOption.trim() || addingOption}
            style={styles.addOptionButton}
          >
            {addingOption ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Ionicons name="add" size={20} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Vote button */}
      {canVote && !hasVoted && selectedOptions.length > 0 && (
        <TouchableOpacity
          style={styles.voteButton}
          onPress={handleVote}
          disabled={voting}
        >
          {voting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.voteButtonText}>Vote</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.pollFooter}>
        <Text style={styles.voteCount}>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        </Text>
        {getTimeRemaining() && (
          <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>
        )}
        {poll.isClosed && (
          <Text style={styles.closedText}>Poll closed</Text>
        )}
      </View>
    </View>
  );
};

// Create Poll Modal
interface CreatePollModalProps {
  visible: boolean;
  chatRoomId: string;
  onClose: () => void;
  onCreated: (poll: Poll) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  chatRoomId,
  onClose,
  onCreated,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState<'single' | 'multiple'>('single');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowsAddOptions, setAllowsAddOptions] = useState(false);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) return;

    try {
      setCreating(true);
      const response = await chatApi.createPoll({
        chatRoomId,
        question: question.trim(),
        options: validOptions,
        pollType,
        isAnonymous,
        allowsAddOptions,
      });

      if (response.success) {
        onCreated(response.poll);
        onClose();
        // Reset form
        setQuestion('');
        setOptions(['', '']);
        setPollType('single');
        setIsAnonymous(false);
        setAllowsAddOptions(false);
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Poll</Text>
          <TouchableOpacity onPress={handleCreate} disabled={creating}>
            {creating ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text style={styles.createText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Question */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Question</Text>
          <TextInput
            style={styles.questionInput}
            placeholder="Ask a question..."
            value={question}
            onChangeText={setQuestion}
            multiline
          />
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Options</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionInputRow}>
              <TextInput
                style={styles.optionInput}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChangeText={(text) => updateOption(index, text)}
              />
              {options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(index)}>
                  <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {options.length < 10 && (
            <TouchableOpacity style={styles.addOptionRow} onPress={addOption}>
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={styles.addOptionText}>Add option</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Settings</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setPollType(pollType === 'single' ? 'multiple' : 'single')}
          >
            <Text style={styles.settingText}>Allow multiple choices</Text>
            <Ionicons
              name={pollType === 'multiple' ? 'checkbox' : 'square-outline'}
              size={24}
              color={pollType === 'multiple' ? '#3B82F6' : '#9CA3AF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <Text style={styles.settingText}>Anonymous voting</Text>
            <Ionicons
              name={isAnonymous ? 'checkbox' : 'square-outline'}
              size={24}
              color={isAnonymous ? '#3B82F6' : '#9CA3AF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setAllowsAddOptions(!allowsAddOptions)}
          >
            <Text style={styles.settingText}>Allow adding options</Text>
            <Ionicons
              name={allowsAddOptions ? 'checkbox' : 'square-outline'}
              size={24}
              color={allowsAddOptions ? '#3B82F6' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pollContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  pollMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pollType: {
    fontSize: 12,
    color: '#6B7280',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonymousText: {
    fontSize: 12,
    color: '#6B7280',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  optionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
  },
  optionProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#EFF6FF',
  },
  optionProgressCorrect: {
    backgroundColor: '#D1FAE5',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    borderRadius: 4,
  },
  radioSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  votePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addOptionInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  addOptionButton: {
    padding: 12,
  },
  voteButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pollFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  voteCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  timeRemaining: {
    fontSize: 13,
    color: '#6B7280',
  },
  closedText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  createText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  addOptionText: {
    fontSize: 15,
    color: '#3B82F6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 15,
    color: '#374151',
  },
});

export default ChatPoll;
