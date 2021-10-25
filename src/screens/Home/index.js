import React, { useState, useEffect, useCallback, useRef, useMemo, createRef } from 'react';
import { FlatList, Dimensions, Alert, VirtualizedList } from 'react-native';
import firebase from '@react-native-firebase/app';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useIsFocused } from '@react-navigation/native';
import Feed from 'screens/Home/Feed/feed';
import { AppStyles } from '../../AppStyles';
import {
  searchVideos,
  setActiveVideo,
  setCurrentVideo,
} from 'src/redux/reducers/video.actions';
import {
  Text,
  View,
  Overlay,
  ActivityIndicator,
  VUView,
} from 'common-components';
import {
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  getBlocking,
} from 'services/social';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

import PushNotification from 'react-native-push-notification';

let currentHomeVideo;

const { height } = Dimensions.get('window');
function Home({ navigation }) {
  const dispatch = useDispatch();
  const videos = useSelector((state) => state.videos.hasOwnProperty('videos') ? state.videos.videos : []);
  const [search, setSearch] = useState('');
  const [videoHeight, setVideoHeight] = useState(height);
  const [searchTerm, setSearchTerm] = useState('');
  currentHomeVideo = useSelector(({ videos }) => videos.currentVideo.id);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const focused = useIsFocused();
  const [videoBlock, setVideoBlock] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const currentuserblock = useSelector(
    (state) => state.social.currentuserblock,
  );
  const [user, setUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([])
  const flatlistRef = useRef();
  let feedComponentRef ;
  useEffect(() => {
    console.log('loading', loading);
    setLoading(loading);
  }, [loading])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // do something
      // console.log(feedComponentRef);
      // if(feedComponentRef != undefined)
      // {
      //   feedComponentRef();
      // }
      
    });

    return unsubscribe;
  }, [navigation]);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      setSearchTerm(value);
      dispatch(searchVideos(value));
    },
    // delay in ms
    1000,
  );

  const handleChangeSearch = (text) => {
    setSearch(text);
    debounced.callback(text);
  };

  const handleClearSearch = () => {
    dispatch(searchVideos(''));
    setSearchTerm('');
    setSearch('');
  };

  const handleVideoBlock = () => {
    setVideoBlock(!videoBlock);
  };

  const handleRefresh = () => {
    dispatch(searchVideos(searchTerm, 0));
  };

  // useEffect(() => {
  //   console.log('search use effect' , searchTerm)
  //   dispatch(searchVideos(searchTerm));
  // }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      dispatch(searchVideos(searchTerm));
      let user = await firebase.auth().currentUser;
      setUser(user);
      let blockedUsers = await getBlocking(user.uid);
      setBlockedUsers(blockedUsers);

      if (currentHomeVideo !== '') {
        dispatch(setActiveVideo(currentHomeVideo));
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (focused) {
      if (!commenting) { }
      setCommenting(false);
    }
  }, [focused, commenting, dispatch, searchTerm]);

  const fetchUser = async () => {
    let newVideos = [];
    console.log('coming in fetch user', newVideos);

    if (blockedUsers.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        let exist = blockedUsers.filter(function (v) {
          return v.id == videos[i].uid;
        });
        if (exist.length == 0) {
          newVideos.push(videos[i]);
        }
      }
    }
    else {
      newVideos = videos;
    }

    console.log('new Videos', newVideos)
    setFilteredVideos(newVideos);

    if (newVideos.length > 0) {
      console.log('coming in fetch user inside if', newVideos.length)
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('new Videos at top', videos)
    fetchUser();
  }, [videos, currentuserblock]);

  const handleCommenting = () => {
    dispatch(setCurrentVideo(''));
    setCommenting(true);
  };
  const handlingViewCount = async (item) => {
    const user = firebase.auth().currentUser;
    await feedVideoViewed(user, item);
  };

  const handleVoting = async (item) => {
    const user = firebase.auth().currentUser;
    voteVideo(user, item);
  };

  const handleUnvoting = async (item) => {
    const user = firebase.auth().currentUser;
    unvoteVideo(user, item);
  };

  const handleViewableItemsChanged = (onChangeIndex) => {
    console.log('current Index', onChangeIndex);
    setCurrentVideoIndex(onChangeIndex.index)
    const viewableItemId = filteredVideos[onChangeIndex.index].id
    dispatch(setActiveVideo(viewableItemId))
    dispatch(setCurrentVideo(viewableItemId))

    // if (viwableIndexArray.length > 1) {
    //   const viewableItemId = filteredVideos[viwableIndexArray[1]].id
    //   dispatch(setActiveVideo(viewableItemId))
    //   dispatch(setCurrentVideo(viewableItemId))
    // }else if (viwableIndexArray.length === 1) {
    //   const viewableItemId = filteredVideos[viwableIndexArray[0]].id
    //   dispatch(setActiveVideo(viewableItemId))
    //   dispatch(setCurrentVideo(viewableItemId))
    // }
  }

  // const handleViewableItemsChanged = useCallback(
  //   ({ viewableItems, changed }) => {
  //     if (changed.length > 0) {
  //       const viewableItems = changed[0]
  //       dispatch(setActiveVideo(viewableItems.key));
  //       dispatch(setCurrentVideo(viewableItems.key));
  //     }

  //     // const viewable =
  //     //   changed.find((obj) => obj.isViewable) ||
  //     //   viewableItems.find((obj) => obj.isViewable);
  //     // if (viewable) {
  //     //   dispatch(setActiveVideo(viewable.key));
  //     //   dispatch(setCurrentVideo(viewable.key));
  //     // }
  //   },
  //   [dispatch],
  // );


  const handleLayoutChanged = (e) => {
    if (videoHeight === height) {
      setVideoHeight(e.nativeEvent.layout.height);
    }
  };
  const keyExtractor = useCallback((item) => item.id, []);

  const handleOnEndReached = () => {
    dispatch(searchVideos(searchTerm));
  };

  const getItemLayout = (data, index) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  });

  const handleAutoScrollToNext = (index) => {
    if (currentVideoIndex == index)
      if (flatlistRef.current != undefined) {
        setTimeout(() => 
          flatlistRef.current.scrollToIndex({ animated: true, index: currentVideoIndex + 1 }), 
          3000)
      }
  }

  // const activeVideoId = useSelector(({ videos }) => videos.active.id);
  const renderVideo = ({ item, index }) => {

    // item.active = activeVideoId === item.id ? true : false
    return (
      <VUView height={`${videoHeight}px`}>
        <Feed
          key={item.id}
          item={item}
          index={index}
          focused={focused}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          onCommenting={handleCommenting}
          OnViewCount={handlingViewCount}
          currentIndex={currentVideoIndex}
          lastIndex={filteredVideos.length}
          navigation={navigation}
        />
      </VUView>
    );
  };

  // if (loading) {
  //   return (
  //     <Overlay>
  //       <ActivityIndicator animating={loading} />
  //     </Overlay>
  //   );
  // }

  // const validVideos = videos.filter((obj) => obj.playback);

  const getItemCount = (data) => {
    return data.length;
  }

  const getItem = (data, index) => {
    return { data: data[index], index };
  }

  return (
    <VUView flex={1}>
      {}
      <VUView flex={1} onLayout={handleLayoutChanged}>
        {!loading ? (
          <SwiperFlatList
            ref={flatlistRef}
            data={filteredVideos}
            extraData={filteredVideos}
            autoplay={false}
            useNativeDriver={true}
            windowSize={5}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            legacyImplementation={true}
            removeClippedSubviews={true}
            disableVirtualization={true}
            showPagination={false}
            vertical={true}
            onRefresh={handleRefresh}
            refreshing={loading}
            renderAll={false}
            onChangeIndex={(index) => handleViewableItemsChanged(index)}
            renderItem={renderVideo}
            onEndReached={handleOnEndReached}
            keyExtractor={keyExtractor}
            viewabilityConfig={{
              minimumViewTime: 100,
              itemVisiblePercentThreshold: 80,
            }}
            onEndReachedThreshold={0.1}
            getItemLayout={getItemLayout}
            ListEmptyComponent={() => {
              return (
                <View flex={1}>
                  <Text color="#000" fontSize={18} textAlign="center">
                    No results found.
                  </Text>
                </View>
              )
            }}
          />
        ) : (
          <Overlay>
            <ActivityIndicator animating={loading} />
          </Overlay>
        )}
      </VUView>
    </VUView>
  );
}

export default Home;
