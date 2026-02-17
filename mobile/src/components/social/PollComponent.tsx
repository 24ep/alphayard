import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';

interface PollOption {
  id: string;
  optionText: string;
  votesCount: number;
  percentage: number;
  hasVoted: boolean;
}

interface Poll {
  id: string;
  postId: string;
  question: string;
  pollType: 'single' | 'multiple';
  allowAddOptions: boolean;
  isAnonymous: boolean;
  totalVotes: number;
  endsAt?: string;
  options: PollOption[];
  hasVoted: boolean;
  myVotes: string[];
  isExpired: boolean;
}

interface PollComponentProps {
  postId: string;
  poll?: Poll;
  onVote?: (poll: Poll) => void;
}

export const PollComponent: React.FC<PollComponentProps> = ({
  postId,
  poll: initialPoll,
  onVote,
}) => {
  const [poll, setPoll] = useState<Poll | null>(initialPoll || null);
  const [loading, setLoading] = useState(!initialPoll);
  const [voting, setVoting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!initialPoll) {
      loadPoll();
    }
  }, [postId]);

  useEffect(() => {
    if (poll?.myVotes) {
      setSelectedOptions(poll.myVotes);
    }
  }, [poll?.myVotes]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getPollByPost(postId);
      if (response.success && response.poll) {
        setPoll(response.poll);
      }
    } catch (error) {
      console.error('Error loading poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (poll?.hasVoted || poll?.isExpired) return;

    if (poll?.pollType === 'single') {
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
    if (!poll || selectedOptions.length === 0) return;

    try {
      setVoting(true);
      const response = await socialApi.voteOnPoll(poll.id, selectedOptions);
      if (response.success && response.poll) {
        setPoll(response.poll);
        onVote?.(response.poll);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const getTimeRemaining = (): string => {
    if (!poll?.endsAt) return '';
    
    const now = new Date();
    const endDate = new Date(poll.endsAt);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (!poll) return null;

  const showResults = poll.hasVoted || poll.isExpired;

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.question}>{poll.question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option) => (
          <PollOptionItem
            key={option.id}
            option={option}
            isSelected={selectedOptions.includes(option.id)}
            showResults={showResults}
            onSelect={() => handleSelectOption(option.id)}
            disabled={poll.hasVoted || poll.isExpired}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.votesText}>
          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
        
        {poll.endsAt && (
          <>
            <View style={styles.dot} />
            <Text style={styles.timeText}>{getTimeRemaining()}</Text>
          </>
        )}
        
        {poll.isAnonymous && (
          <>
            <View style={styles.dot} />
            <Ionicons name="eye-off-outline" size={14} color="#9CA3AF" />
            <Text style={styles.anonText}>Anonymous</Text>
          </>
        )}
      </View>

      {/* Vote Button */}
      {!showResults && selectedOptions.length > 0 && (
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
    </View>
  );
};

interface PollOptionItemProps {
  option: PollOption;
  isSelected: boolean;
  showResults: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const PollOptionItem: React.FC<PollOptionItemProps> = ({
  option,
  isSelected,
  showResults,
  onSelect,
  disabled,
}) => {
  const progressWidth = new Animated.Value(0);

  useEffect(() => {
    if (showResults) {
      Animated.timing(progressWidth, {
        toValue: option.percentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [showResults, option.percentage]);

  return (
    <TouchableOpacity
      style={[
        styles.optionItem,
        isSelected && !showResults && styles.optionSelected,
        option.hasVoted && showResults && styles.optionVoted,
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {/* Progress Bar Background */}
      {showResults && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: option.hasVoted ? '#DBEAFE' : '#F3F4F6',
            },
          ]}
        />
      )}

      {/* Option Content */}
      <View style={styles.optionContent}>
        <View style={styles.optionLeft}>
          {!showResults && (
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          )}
          <Text style={[
            styles.optionText,
            option.hasVoted && styles.optionTextVoted,
          ]}>
            {option.optionText}
          </Text>
        </View>

        {showResults && (
          <Text style={[
            styles.percentageText,
            option.hasVoted && styles.percentageTextVoted,
          ]}>
            {option.percentage}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Create Poll Modal Component
interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePoll: (pollData: {
    question: string;
    options: string[];
    pollType: 'single' | 'multiple';
    endsAt?: string;
  }) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState<'single' | 'multiple'>('single');

  const addOption = () => {
    if (options.length < 6) {
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

  const handleCreate = () => {
    const validOptions = options.filter(o => o.trim() !== '');
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll({
        question: question.trim(),
        options: validOptions,
        pollType,
      });
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setPollType('single');
      onClose();
    }
  };

  if (!visible) return null;

  // This would be a Modal - simplified for now
  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    position: 'relative',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionVoted: {
    borderColor: '#3B82F6',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 7,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  optionTextVoted: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentageTextVoted: {
    color: '#1E40AF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  votesText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
  },
  timeText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  anonText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  voteButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PollComponent;
