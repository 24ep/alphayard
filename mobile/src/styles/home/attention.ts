import { StyleSheet } from 'react-native';

export const attentionStyles = StyleSheet.create({
  // Single Line Attention Card
  attentionCardLine: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  attentionCardGradient: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attentionCardLineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attentionCardLineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attentionCardLineContent: {
    flex: 1,
  },
  attentionCardLineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  attentionCardLineSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  attentionCardLineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attentionCardLineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  attentionCardLineBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Drawer
  attentionDrawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attentionDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  attentionDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  attentionDrawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  attentionDrawerCloseButton: {
    padding: 4,
  },
  attentionDrawerList: {
    flex: 1,
  },
  attentionDrawerListContent: {
    paddingBottom: 20,
  },
  // Aligned with goals design pattern
  attnListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  attnItemLeft: {
    marginRight: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  attnIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attnItemRight: {
    flex: 1,
  },
  attnItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attnItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  attnItemSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  attnItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  attnMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attnMetaText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  attnPriorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attnPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});


