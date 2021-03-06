import React, {useEffect, useState,useRef} from 'react';
import {AppStyles} from 'src/AppStyles';
import {FlatList, Dimensions,Keyboard} from 'react-native';
import { CheckBox } from 'react-native-elements'
import {useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import {VUView,VUScrollView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput,Overlay,KeyboardAvoidingView} from 'common-components';
import {IonIcon} from 'src/icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ChatItem from 'screens/Chat/feed/chatitem';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import * as Progress from 'react-native-progress';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';
import Header from 'common-components/Header'

const EditGroupChat = ({route, onBack}) => {
    const navigation = useNavigation();
    const actionSheetRef = useRef();
    const user = useSelector(state => state.auth.user);
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    const [loading, setLoading] = useState(true);
    const [uploadingimage, setUploadingImage] = useState(false);
    const [privatechat, setPrivateChat] = useState(false);
    const [groupname, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [uploadimageurl, setUploadImageUrl] = useState("");
    const [showimageurl, setShowImageUrl] = useState("");
    const {groupfield = {}} = route.params;
    useEffect(() => {
        setLoading(false);   
        setUploadImageUrl(groupfield.profile);
        setShowImageUrl(groupfield.profile);
        setGroupName(groupfield.fullname);
        setDescription(groupfield.lastmsg);
        setPrivateChat(groupfield.status);
    }, [groupfield]);

    const handleBackPressed = () => {
        dissMissKeyBoard(true, function() {
        setTimeout(() => {
            navigation.goBack();
        }, 125);
        });
    };

    function dissMissKeyBoard(isKeyboardNeedToClose, callback) {
        Keyboard.dismiss();
        callback();
    }
    
    const onChangeGroupName=(text)=>{
        setGroupName(text)
    }
    const onChangeDecription=(text)=>{
        setDescription(text)
    }

    const onEditGroup=async()=>{
        if(groupname.trim()!= "" && description.trim()!= ""){
            const batch = firestore().batch();
            const rmsgRef = firestore()
                .collection("groupchats")
                .doc(groupfield.id);               
            batch.update(rmsgRef, {
                ["profile"]: uploadimageurl,
                ["fullname"]: groupname,
                ["lastmsg"]: description,
                ["status"]:privatechat,
            });
            await batch.commit();
            Toast.show('Successfully updated Information.', Toast.LONG);
        }else{
            Toast.show('Please input empty field.', Toast.LONG);
        }
    }

    const handleGallery = async () => {
        console.log('Gallery');
        ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: false,
        compressImageMaxHeight: 1024,
        compressImageQuality: 0.8,
        }).then(async (selectedImages) => {
            actionSheetRef.current?.hide();
            var image = selectedImages.path;
            setShowImageUrl(image);
            console.log('images', image);
            setUploadingImage(true);
            try {
                const filePage = 'chats/' + image.split('/').pop();
                const reference = storage().ref(filePage);
                await reference.putFile(image);
                const uploadedImage = await reference.getDownloadURL();
                console.log('uploadedImages', uploadedImage);
                setUploadImageUrl(uploadedImage);
                setUploadingImage(false);
            } catch (error) {
                setUploadingImage(false);
                console.log('error:', error);
            }
        });
    };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView>
          <ScrollView>
            <VUView bg={AppStyles.color.bgWhite} flex={1} height={windowHeight}>
                <Header 
                    headerTitle="Edit Group Infomation"
                    onLeftPress={handleBackPressed}
                />
                <VUView flex={1}>
                    {loading ?
                        <ActivityIndicator animating={loading}/> 
                        :
                        <VUView flex={1} justifyContent="space-between">
                            <VUView></VUView>
                            <VUView>
                                <VUView m={'5px'} alignItems="center">
                                    <VUView>
                                        {showimageurl?
                                            <VUImage
                                                width="150px"
                                                height="150px"
                                                source={{uri: showimageurl}}
                                                resizeMode="cover"
                                                borderRadius={100}
                                            />
                                            :
                                            <IonIcon name="person-circle-outline" size={150} color="#bbb" />
                                        }
                                        <VUView  style={{position: 'absolute', top:100, left:100}} bg={AppStyles.color.textBlue} borderRadius={100} padding={1}>
                                            <IonIcon name="camera" onPress={handleGallery} size={35} color={AppStyles.color.white} />
                                        </VUView>
                                    </VUView>
                                </VUView>
                            </VUView>
                            <VUView mt={1} mx={3}>
                                <VUText color = {AppStyles.color.textBlue}>Group Name</VUText>
                                <VUTextInput
                                    py={2}
                                    px={3}
                                    p={1}
                                    width ="100%"
                                    height = {50}
                                    placeholder="Type here"
                                    placeholderTextColor={AppStyles.color.textBlue}
                                    autoCapitalize="none"
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    onChangeText={text => onChangeGroupName(text) }
                                    value={groupname}
                                    color = {AppStyles.color.textBlue}
                                    borderBottomColor={AppStyles.color.grayText}
                                    borderBottomWidth={1}
                                />
                            </VUView>
                            <VUView mt={1} mx={3}>
                                <VUText color = {AppStyles.color.textBlue}>Decription</VUText>
                                <VUTextInput
                                    py={2}
                                    px={3}
                                    p={1}
                                    width ="100%"
                                    placeholder="Type here"
                                    placeholderTextColor={AppStyles.color.textBlue}
                                    autoCapitalize="none"
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    onChangeText={text => onChangeDecription(text) }
                                    value={description}
                                    color = {AppStyles.color.textBlue}
                                    borderBottomColor={AppStyles.color.grayText}
                                    borderBottomWidth={1}
                                />
                            </VUView>
                            <VUView>
                            <CheckBox
                                title='Private Group Chat'
                                checkedColor={AppStyles.color.textBlue}
                                uncheckedColor={AppStyles.color.textBlue}                                 
                                checked={privatechat} 
                                containerStyle={{backgroundColor:"#fff", borderWidth:0}}
                                onPress={()=>{setPrivateChat(!privatechat)}}
                            />
                            </VUView>
                            <VUView flex={1}/> 
                            <VUView alignItems="center">
                                <VUTouchableOpacity onPress={onEditGroup}>
                                    <VUView padding={3} bg={AppStyles.color.textBlue} borderRadius={100} >
                                        <VUText color = {AppStyles.color.white}>Update Group</VUText>
                                    </VUView>
                                </VUTouchableOpacity>
                            </VUView>
                            <VUView flex={1}/> 
                            {uploadingimage &&
                                <Progress.Bar indeterminate={true} width={windowWidth} />
                            }
                            <VUView/>
                        </VUView>
                    }
                </VUView>
            </VUView>
          </ScrollView>        
      </SafeAreaView>
    </KeyboardAvoidingView>
    
  );
}

export default EditGroupChat;