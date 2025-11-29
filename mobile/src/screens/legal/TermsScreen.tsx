import React from 'react';
import {
  ScrollView,
} from 'react-native';
import {
  Box,
  Text,
  VStack,
  Heading,
  Divider,
} from 'native-base';

const TermsScreen: React.FC = () => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Box flex={1} bg="white" px={6} py={8}>
        <VStack space={6}>
          <Heading size="xl" color="gray.800">
            Terms & Conditions
          </Heading>

          <VStack space={4}>
            <Text color="gray.600" fontSize="md">
              Last updated: {new Date().toLocaleDateString()}
            </Text>

            <Divider />

            <VStack space={4}>
              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  1. Acceptance of Terms
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  By accessing and using Bondarys, you accept and agree to be bound by the terms and provision of this agreement.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  2. Use License
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  Permission is granted to temporarily download one copy of Bondarys for personal, non-commercial transitory viewing only.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  3. Privacy Policy
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  4. User Account
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  5. Prohibited Uses
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  You may not use the Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  6. Termination
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  7. Limitation of Liability
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  In no event shall Bondarys, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  8. Governing Law
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  These Terms shall be interpreted and governed by the laws of the jurisdiction in which Bondarys operates.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  9. Changes to Terms
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  10. Contact Information
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  If you have any questions about these Terms, please contact us at support@bondarys.com
                </Text>
              </VStack>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default TermsScreen; 