import React, {useState, useEffect, useCallback} from 'react';

import {useIsFocused, useNavigation} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import {useDispatch, useSelector} from 'react-redux';
import {FlatList, Dimensions, Platform,Text} from 'react-native';
import Feed from '../Home/Feed';
import {searchMyVideos, setActiveVideo} from 'src/redux/reducers/video.actions';
import {
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  voteEntry,
  unvoteEntry,
  competitionVideoViewed,
} from 'services/social';
import {IonIcon} from 'src/icons';
import {VUView, VUTouchableOpacity} from 'common-components';
import {AppStyles} from 'src/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
const {height} = Dimensions.get('window');
const OneCompetitionVideos = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {competitionid = 0, index = 0, videolist = []} = route.params || {};
  const entrylist = useSelector((state) => state.feeds.entryList);

  let competitionVideos = useSelector((state) =>
    state.videos.competitionVideos.hasOwnProperty('competitionVideos')
      ? state.videos.competitionVideos.competitionVideos
      : [],
  );
  const [active, setActive] = useState(0);
  const [videoHeight, setVideoHeight] = useState(height);
  const [activeIndex, setActiveIndex] = useState(index);
  // const [focused, setFocused] = useState(true);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    setLoading(false);
  }, [entrylist]);

  const handleVoting = async (item) => {
    const user = firebase.auth().currentUser;
    await voteEntry(user, item);
  };

  const handleUnvoting = async (item) => {
    const user = firebase.auth().currentUser;
    await unvoteEntry(user, item);
  };
  const handlingViewCount = async (item) => {
    const user = firebase.auth().currentUser;
    await competitionVideoViewed(user, item);
  };

  const handleViewableItemsChanged = (onChangeIndex) => {
    const viewableItemId = entrylist[onChangeIndex.index].id;
    setCurrentVideoIndex(onChangeIndex.index)
    dispatch(setActiveVideo(viewableItemId));
    setActive({
      id: viewableItemId,
      index: onChangeIndex.index,
    });
}
  // const handleVieweableItemsChanged = useCallback(
  //   ({viewableItems, changed}) => {
  //     const viewable =
  //       changed.find((obj) => obj.isViewable) ||
  //       viewableItems.find((obj) => obj.isViewable);
  //     if (viewable) {
  //       dispatch(setActiveVideo(viewable.key));
  //       setActive({
  //         id: viewable.item.id,
  //         index: viewable.index,
  //       });
  //     }
  //     // Since it has no dependencies, this function is created only once
  //   },
  //   [],
  // );
  // if (loading) {
  //   return (
  //     <Overlay>
  //       <ActivityIndicator animating={loading} />
  //     </Overlay>
  //   );
  // }
  const getItemLayout = (data, index) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  });
  const handleLayoutChanged = (e) => {
    if (videoHeight === height) {
      setVideoHeight(e.nativeEvent.layout.height);
    }
  };
  const renderVideo = ({item, index}) => {
    return (
      <VUView height={`${videoHeight}px`}>
        <Feed
          type="competition"
          key={item.id}
          item={item}
          index={index}
          focused={focused}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          OnViewCount={handlingViewCount}
          currentIndex={currentVideoIndex}
          lastIndex={entrylist.length}
          navigation={navigation}
        />
      </VUView>
    );
  };
  const handleBackPressed = () => {
    navigation.goBack();
  };

  return (
    <VUView
      flex={1}
      bg={AppStyles.color.bgWhite}
      onLayout={handleLayoutChanged}>
      {!loading &&
        entrylist.length > 0 ? (
       
          // (Platform.OS == 'android' ? videoHeight != height : true) && (
          <VUView flex={1}>
            <SwiperFlatList
              autoplay={false}
              useNativeDriver={true}
              windowSize={5}
              initialNumToRender={10}
              removeClippedSubviews={true}
              showPagination={false}
              vertical={true}
              data={entrylist}
              renderAll={false}
              index={activeIndex}
              onChangeIndex={(index) => handleViewableItemsChanged(index)}
              renderItem={renderVideo}
              keyExtractor={(item) => item.id}
              viewabilityConfig={{
                minimumViewTime: 100,
                itemVisiblePercentThreshold: 80,
              }}
              getItemLayout={getItemLayout}
            />
          
            {/* <FlatList
              data={entrylist}
              onViewableItemsChanged={handleVieweableItemsChanged}
              viewabilityConfig={{
                minimumViewTime: 300,
                itemVisiblePercentThreshold: 80,
              }}
              renderItem={renderVideo}
              keyExtractor={(item) => item.id}
              initialScrollIndex={activeIndex}
              windowSize={25}
              pagingEnabled={true}
              removeClippedSubviews={true}
              getItemLayout={getItemLayout}
            /> */}
 
            <VUView
              position="absolute"
              width="100%"
              mt={insets.top}
              alignItems="flex-start"
              p={2}>
              <VUTouchableOpacity onPress={handleBackPressed}>
                <IonIcon
                  bold
                  name="chevron-back"
                  size={38}
                  color={AppStyles.color.white}
                />
              </VUTouchableOpacity>
            </VUView>
          </VUView>
        ):null}
    </VUView>
  );
};

export default OneCompetitionVideos;
