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

const PrivacyScreen: React.FC = () => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Box flex={1} bg="white" px={6} py={8}>
        <VStack space={6}>
          <Heading size="xl" color="gray.800">
            Privacy Policy
          </Heading>

          <VStack space={4}>
            <Text color="gray.600" fontSize="md">
              Last updated: {new Date().toLocaleDateString()}
            </Text>

            <Divider />

            <VStack space={4}>
              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  1. Information We Collect
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  2. Personal Information
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  This may include your name, email address, phone number, date of birth, and other information you choose to provide.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  3. Location Information
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  With your consent, we may collect and process your location information to provide Circle safety features.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  4. Device Information
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We may collect information about your device, including your IP address, operating system, and browser type.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  5. How We Use Your Information
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure your safety.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  6. Information Sharing
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  7. Data Security
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  8. Your Rights
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  You have the right to access, update, or delete your personal information. You can also opt out of certain communications.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  9. Cookies and Tracking
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We may use cookies and similar tracking technologies to enhance your experience and collect usage information.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  10. Children's Privacy
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  11. Changes to This Policy
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </Text>
              </VStack>

              <VStack space={2}>
                <Heading size="md" color="gray.800">
                  12. Contact Us
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="md">
                  If you have any questions about this Privacy Policy, please contact us at privacy@bondarys.com
                </Text>
              </VStack>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default PrivacyScreen; 
