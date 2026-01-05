import React, { useState } from 'react';
import { Modal, VStack, Text, HStack, Button, IconButton, Box } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { emotionService } from '../../services/emotionService';

interface EmotionCheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const EmotionCheckInModal: React.FC<EmotionCheckInModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const [submitting, setSubmitting] = useState(false);

    const handleSelectEmotion = async (level: number) => {
        try {
            setSubmitting(true);
            await emotionService.submitEmotionCheck(level);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit emotion:', error);
            // Optional: Show alert
        } finally {
            setSubmitting(false);
        }
    };

    const emotions = [
        { level: 1, icon: 'emoticon-dead-outline', color: '#FF4444', label: 'Very Bad' },
        { level: 2, icon: 'emoticon-sad-outline', color: '#FF8800', label: 'Bad' },
        { level: 3, icon: 'emoticon-neutral-outline', color: '#FFBB00', label: 'Okay' },
        { level: 4, icon: 'emoticon-happy-outline', color: '#88CC00', label: 'Good' },
        { level: 5, icon: 'emoticon-excited-outline', color: '#00AA00', label: 'Great' },
    ];

    return (
        <Modal isOpen={visible} onClose={onClose} size="lg">
            <Modal.Content maxWidth="400px" p={4}>
                <VStack space={2} mb={4}>
                    <Text fontSize="xl" fontWeight="bold" textAlign="left">
                        How are you feeling?
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="left">
                        Track your mood to see your wellbeing history.
                    </Text>
                </VStack>

                <Modal.Body p={0}>
                    <VStack space={6} alignItems="center">
                        <HStack space={2} justifyContent="center" flexWrap="wrap" w="100%">
                            {emotions.map((e) => (
                                <VStack key={e.level} alignItems="center" m={2}>
                                    <IconButton
                                        icon={<Icon name={e.icon} size={40} color={e.color} />}
                                        onPress={() => handleSelectEmotion(e.level)}
                                        isDisabled={submitting}
                                        rounded="full"
                                        _pressed={{
                                            bg: `${e.color}20`
                                        }}
                                        p={3}
                                    />
                                    <Text fontSize="xs" fontWeight="500" mt={1}>{e.label}</Text>
                                </VStack>
                            ))}
                        </HStack>

                        <Button
                            variant="unstyled"
                            size="sm"
                            onPress={onClose}
                            _text={{ color: "gray.400", fontSize: "xs" }}
                        >
                            Decline to answer
                        </Button>
                    </VStack>
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};
