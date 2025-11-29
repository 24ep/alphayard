import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { AssetCard } from '../../types/home';

interface AssetCardsProps {
  cards: AssetCard[];
  onCardPress: (card: AssetCard) => void;
  onAddWalletPress: () => void;
}

const AssetCards: React.FC<AssetCardsProps> = ({
  cards,
  onCardPress,
  onAddWalletPress,
}) => {
  const renderAssetCard = (card: AssetCard) => (
    <TouchableOpacity
      key={card.id}
      style={homeStyles.assetCard}
      onPress={() => onCardPress(card)}
    >
      <View style={homeStyles.assetCardContainer}>
        {/* Progress Background */}
        {card.progress && (
          <View style={homeStyles.assetProgressBackground}>
            <View
              style={[
                homeStyles.assetProgressFill,
                {
                  width: `${card.progress}%`,
                  backgroundColor: card.color,
                },
              ]}
            />
          </View>
        )}

        <LinearGradient
          colors={[card.color, `${card.color}CC`]}
          style={homeStyles.assetGradient}
        >
          <View style={homeStyles.assetContent}>
            <View style={homeStyles.assetLeft}>
              <View style={homeStyles.coinIcon}>
                <IconMC name={card.icon} size={32} color="#FFFFFF" />
                <IconMC
                  name="star"
                  size={12}
                  color="#FFD700"
                  style={homeStyles.sparkle1}
                />
                <IconMC
                  name="star"
                  size={8}
                  color="#FFD700"
                  style={homeStyles.sparkle2}
                />
              </View>
            </View>
            <View style={homeStyles.assetRight}>
              <Text style={homeStyles.assetLabel}>{card.title}</Text>
              <Text style={homeStyles.assetValue}>{card.value}</Text>
              <Text style={homeStyles.assetTarget}>
                {card.changeType === 'positive' ? '+' : ''}{card.change}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={homeStyles.assetCardsScroll}
      contentContainerStyle={homeStyles.assetCardsContainer}
    >
      {cards.map(renderAssetCard)}
      
      {/* Add Wallet Button */}
      <TouchableOpacity
        style={homeStyles.circularAddWalletButton}
        onPress={onAddWalletPress}
      >
        <View style={homeStyles.circularAddWalletIcon}>
          <IconMC name="plus" size={24} color="#FFFFFF" />
        </View>
        <Text style={homeStyles.circularAddWalletText}>Add Wallet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AssetCards;
