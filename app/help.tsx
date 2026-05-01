import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'faq-001',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from the Orders tab. Click on your active order to see live tracking with driver location and estimated delivery time.',
      category: 'Orders',
    },
    {
      id: 'faq-002',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and cash on delivery.',
      category: 'Payment',
    },
    {
      id: 'faq-003',
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order within 2 minutes of placing it. Go to Orders, select your order, and tap Cancel Order. After 2 minutes, please contact support.',
      category: 'Orders',
    },
    {
      id: 'faq-004',
      question: 'What is the delivery fee?',
      answer: 'Delivery fees vary by restaurant and distance, typically ranging from $1.99 to $4.99. Some restaurants offer free delivery on orders above a certain amount.',
      category: 'Delivery',
    },
    {
      id: 'faq-005',
      question: 'How do I apply a promo code?',
      answer: 'Enter your promo code at checkout before placing your order. The discount will be automatically applied to your total.',
      category: 'Promotions',
    },
    {
      id: 'faq-006',
      question: 'What if my order is wrong or missing items?',
      answer: 'Contact us immediately through the app or call support. We will work with the restaurant to resolve the issue and may offer a refund or redelivery.',
      category: 'Orders',
    },
    {
      id: 'faq-007',
      question: 'How do I change my delivery address?',
      answer: 'You can manage your delivery addresses in Profile > Addresses. Add, edit, or delete addresses as needed.',
      category: 'Account',
    },
    {
      id: 'faq-008',
      question: 'Can I schedule an order for later?',
      answer: 'Yes! At checkout, select "Schedule for later" and choose your preferred delivery time.',
      category: 'Orders',
    },
  ];

  const toggleFAQ = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = (method: 'phone' | 'email' | 'chat') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (method) {
      case 'phone':
        Linking.openURL('tel:+15550123456');
        break;
      case 'email':
        Linking.openURL('mailto:support@fooddelivery.com');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Opening live chat support...');
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>

          <Pressable
            onPress={() => handleContactSupport('phone')}
            style={[styles.contactCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="call" size={24} color={theme.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: theme.text }]}>Phone Support</Text>
              <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                +1 (555) 012-3456
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            onPress={() => handleContactSupport('email')}
            style={[styles.contactCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="mail" size={24} color={theme.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: theme.text }]}>Email Support</Text>
              <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                support@fooddelivery.com
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            onPress={() => handleContactSupport('chat')}
            style={[styles.contactCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="chatbubbles" size={24} color={theme.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: theme.text }]}>Live Chat</Text>
              <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                Available 24/7
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Frequently Asked Questions
          </Text>

          {faqs.map((faq) => (
            <Pressable
              key={faq.id}
              onPress={() => toggleFAQ(faq.id)}
              style={[
                styles.faqCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: expandedId === faq.id ? theme.primary : 'transparent',
                  borderWidth: expandedId === faq.id ? 1 : 0,
                },
              ]}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <View style={[styles.faqCategory, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.faqCategoryText, { color: theme.primary }]}>
                      {faq.category}
                    </Text>
                  </View>
                  <Text style={[styles.faqQuestionText, { color: theme.text }]}>
                    {faq.question}
                  </Text>
                </View>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
              {expandedId === faq.id && (
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  {faq.answer}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Links</Text>

          <Pressable
            style={[styles.linkCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('Terms of Service', 'Opening terms...')}
          >
            <Text style={[styles.linkText, { color: theme.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.linkCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('Privacy Policy', 'Opening privacy policy...')}
          >
            <Text style={[styles.linkText, { color: theme.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.linkCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('Community Guidelines', 'Opening guidelines...')}
          >
            <Text style={[styles.linkText, { color: theme.text }]}>Community Guidelines</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  faqCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
