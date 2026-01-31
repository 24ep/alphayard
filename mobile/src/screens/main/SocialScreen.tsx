import React, { useState, useMemo } from 'react';
import { View, Animated, Alert, ImageBackground } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useFocusEffect } from '@react-navigation/native';
import { homeStyles } from '../../styles/homeStyles';
import { SocialTab } from '../../components/home/SocialTab';
import { useUserData } from '../../contexts/UserDataContext';
import { useLegacyHomeScreen } from '../../hooks/home/useLegacyHomeScreen';
import { FloatingCreatePostButton } from '../../components/home/FloatingCreatePostButton';
import { CreatePostModal } from '../../components/home/CreatePostModal';
import { CommentDrawer } from '../../components/home/CommentDrawer';
import { WelcomeSection } from '../../components/home/WelcomeSection';
import { ScreenBackground } from '../../components/ScreenBackground';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { socialService } from '../../services/dataServices';
import { SortOrder, GeoScope, DistanceUnit, CustomCoordinates } from '../../components/social/PostFilterHeader';
import { LocationFilterDrawer } from '../../components/social/LocationFilterDrawer';

const SocialScreen: React.FC = () => {
    const { families, selectedCircle } = useUserData();
    // useHomeBackground();
    const [socialRefreshKey, setSocialRefreshKey] = useState(0);
    const [isPosting, setIsPosting] = useState(false);

    const {
        showCreatePostModal,
        setShowCreatePostModal,
        newPostContent,
        setNewPostContent,
        showCommentDrawer,
        handleCommentPress,
        handleCloseCommentDrawer,
        comments,
        loadingComments,
        newComment,
        setNewComment,
        commentAttachments,
        handleAddAttachment,
        handleRemoveAttachment,
        handleAddComment,
        handleLikeComment,
        handleLinkPress,
    } = useLegacyHomeScreen();

    const [postMedia, setPostMedia] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);
    const [postLocationLabel, setPostLocationLabel] = useState<string | null>(null);
    const [postCoordinates, setPostCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

    const handlePickMedia = async (type: 'image' | 'video') => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need media permissions to attach media.');
                return;
            }
            const mediaType = type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos;
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: mediaType, quality: 0.8 });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPostMedia({ type, uri: result.assets[0].uri });
            }
        } catch (e) {
            console.error('pick media error', e);
        }
    };

    const handleClearMedia = () => setPostMedia(null);

    const handlePickLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need location permission to attach your location.');
                return;
            }
            const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setPostCoordinates({
                latitude: coords.coords.latitude,
                longitude: coords.coords.longitude
            });
            let label = `${coords.coords.latitude.toFixed(5)}, ${coords.coords.longitude.toFixed(5)}`;
            try {
                const geocode = await Location.reverseGeocodeAsync({ latitude: coords.coords.latitude, longitude: coords.coords.longitude });
                if (geocode && geocode[0]) {
                    const a = geocode[0];
                    const parts = [a.street, a.city, a.region].filter(Boolean);
                    if (parts.length) label = parts.join(', ');
                }
            } catch { }
            setPostLocationLabel(label);
        } catch (e) {
            console.error('pick location error', e);
        }
    };

    const handleClearLocation = () => {
        setPostLocationLabel(null);
        setPostCoordinates(null);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            Alert.alert('Empty Post', 'Please write something to post.');
            return;
        }

        try {
            setIsPosting(true);
            if (!families || families.length === 0) {
                Alert.alert('No Circle Found', 'You need to join a circle to post.');
                setIsPosting(false);
                return;
            }

            const matchingCircle = (families as any[]).find(f => f.name === selectedCircle);
            const targetCircleId = matchingCircle?.id || (families as any[])[0]?.id;

            if (!targetCircleId) {
                Alert.alert('Error', 'Could not determine which circle to post to.');
                setIsPosting(false);
                return;
            }

            const created = {
                content: newPostContent,
                circleId: targetCircleId,
                media: postMedia ? { type: postMedia.type, url: postMedia.uri } : undefined,
                location: postLocationLabel || undefined,
                latitude: postCoordinates?.latitude,
                longitude: postCoordinates?.longitude,
                tags: [],
            };

            await socialService.createPost(created);

            setSocialRefreshKey(prev => prev + 1);
            setShowCreatePostModal(false);
            setNewPostContent('');
            setPostMedia(null);
            setPostLocationLabel(null);
        } catch (error) {
            console.error('Failed to create post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setIsPosting(false);
        }
    };

    const currentCircleId = (families as any[]).find(f => f.name === selectedCircle)?.id;

    const { animateToHome, cardMarginTopAnim } = useNavigationAnimation();

    useFocusEffect(
        React.useCallback(() => {
            animateToHome();
        }, [animateToHome])
    );

    const { theme } = useTheme();

    // Filter state lifted from SocialTab
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
    const [geoScope, setGeoScope] = useState<GeoScope>('nearby');
    const [distanceKm, setDistanceKm] = useState<number | null>(5);
    const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
    const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
    const [customCoordinates, setCustomCoordinates] = useState<CustomCoordinates | undefined>();
    const [locationFilterVisible, setLocationFilterVisible] = useState(false);

    const getHeaderLabel = () => {
        if (geoScope === 'worldwide') return 'Worldwide';
        if (geoScope === 'country') return selectedCountry || 'Country';
        if (geoScope === 'custom') return customCoordinates?.name || 'Custom';
        if (geoScope === 'following') return 'Following';
        // Nearby
        const dist = distanceUnit === 'mile' ? (distanceKm || 0) * 0.621371 : (distanceKm || 0);
        return `Nearby ${dist.toFixed(0)}${distanceUnit === 'mile' ? 'mi' : 'km'}`;
    };

    const getHeaderIcon = () => {
        if (geoScope === 'worldwide') return 'earth';
        if (geoScope === 'country') return 'flag';
        if (geoScope === 'custom') return 'crosshairs-gps';
        if (geoScope === 'following') return 'account-group';
        return 'map-marker-radius'; // Nearby
    };

    return (
        <ScreenBackground screenId="social">
            <SafeAreaView style={homeStyles.container}>
                <WelcomeSection
                    mode="social"
                    title={getHeaderLabel()}
                    labelAbove="Social Feed"
                    leftIcon={getHeaderIcon()}
                    onTitlePress={() => setLocationFilterVisible(true)}
                >
                    <View style={{ height: 20 }} />
                </WelcomeSection>

                <Animated.View style={[
                    homeStyles.mainContentCard,
                    {
                        transform: [{ translateY: cardMarginTopAnim }],
                        backgroundColor: '#FFFFFF',
                        flex: 1,
                    }
                ]}>
                    <View style={{ flex: 1, paddingTop: 10 }}>
                        <SocialTab
                            onCommentPress={handleCommentPress}
                            circleId={currentCircleId}
                            refreshKey={socialRefreshKey}
                            // Pass Filter Props
                            geoScope={geoScope}
                            distanceKm={distanceKm}
                            selectedCountry={selectedCountry}
                            customCoordinates={customCoordinates}
                            sortOrder={sortOrder}
                        />
                    </View>
                </Animated.View>

                {/* Drawers and Modals */}
                <LocationFilterDrawer
                    visible={locationFilterVisible}
                    onClose={() => setLocationFilterVisible(false)}
                    geoScope={geoScope}
                    onGeoScopeChange={setGeoScope}
                    distanceKm={distanceKm}
                    onDistanceChange={setDistanceKm}
                    distanceUnit={distanceUnit}
                    onDistanceUnitChange={setDistanceUnit}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                    customCoordinates={customCoordinates}
                    onCustomCoordinatesChange={setCustomCoordinates}
                />

                <FloatingCreatePostButton
                    visible={true}
                    onPress={() => setShowCreatePostModal(true)}
                />

                <CreatePostModal
                    visible={showCreatePostModal}
                    onClose={() => setShowCreatePostModal(false)}
                    newPostContent={newPostContent}
                    setNewPostContent={setNewPostContent}
                    onPost={handleCreatePost}
                    media={postMedia}
                    onPickMedia={handlePickMedia}
                    onClearMedia={handleClearMedia}
                    locationLabel={postLocationLabel}
                    onPickLocation={handlePickLocation}
                    onClearLocation={handleClearLocation}
                    loading={isPosting}
                />

                <CommentDrawer
                    visible={showCommentDrawer}
                    onClose={handleCloseCommentDrawer}
                    comments={comments}
                    loading={loadingComments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    commentAttachments={commentAttachments}
                    onAddAttachment={handleAddAttachment}
                    onRemoveAttachment={handleRemoveAttachment}
                    onAddComment={handleAddComment}
                    onLikeComment={handleLikeComment}
                    onLinkPress={handleLinkPress}
                />
            </SafeAreaView>
        </ScreenBackground>
    );
};

export default SocialScreen;

